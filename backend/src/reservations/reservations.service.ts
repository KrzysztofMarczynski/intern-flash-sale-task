import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './reservation-status.enum';
import { PayReservationDto } from './dto/pay-reservation.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOne(Event, {
        where: {
          id: createReservationDto.eventId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.availableTickets <= 0) {
        throw new BadRequestException('No tickets available');
      }

      event.availableTickets -= 1;

      await queryRunner.manager.save(Event, event);

      const reservation = queryRunner.manager.create(Reservation, {
        eventId: event.id,
        userId: createReservationDto.userId,
        status: ReservationStatus.RESERVED,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const savedReservation = await queryRunner.manager.save(
        Reservation,
        reservation,
      );

      await queryRunner.commitTransaction();

      this.realtimeService.emitEventTicketsUpdated({
        eventId: event.id,
        availableTickets: event.availableTickets,
      });

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async pay(payReservationDto: PayReservationDto): Promise<Reservation> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: {
          id: payReservationDto.reservationId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.status !== ReservationStatus.RESERVED) {
        throw new BadRequestException('Reservation is not payable');
      }

      if (reservation.expiresAt <= new Date()) {
        throw new BadRequestException('Reservation has expired');
      }

      reservation.status = ReservationStatus.PAID;

      const paidReservation = await queryRunner.manager.save(
        Reservation,
        reservation,
      );

      await queryRunner.commitTransaction();

      return paidReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  @Cron(CronExpression.EVERY_30_SECONDS)
  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expiredReservations = await queryRunner.manager.find(Reservation, {
        where: {
          status: ReservationStatus.RESERVED,
          expiresAt: LessThan(new Date()),
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      const expiredCountByEventId = new Map<string, number>();

      for (const reservation of expiredReservations) {
        reservation.status = ReservationStatus.EXPIRED;

        const currentCount =
          expiredCountByEventId.get(reservation.eventId) ?? 0;
        expiredCountByEventId.set(reservation.eventId, currentCount + 1);
      }

      await queryRunner.manager.save(Reservation, expiredReservations);

      const updatedEvents: Event[] = [];

      for (const [eventId, expiredCount] of expiredCountByEventId) {
        await queryRunner.manager.increment(
          Event,
          { id: eventId },
          'availableTickets',
          expiredCount,
        );

        const updatedEvent = await queryRunner.manager.findOne(Event, {
          where: { id: eventId },
        });

        if (updatedEvent) {
          updatedEvents.push(updatedEvent);
        }
      }

      await queryRunner.commitTransaction();
      for (const updatedEvent of updatedEvents) {
        this.realtimeService.emitEventTicketsUpdated({
          eventId: updatedEvent.id,
          availableTickets: updatedEvent.availableTickets,
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
