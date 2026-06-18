import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  totalTickets!: number;

  @Column()
  availableTickets!: number;

  @OneToMany(() => Reservation, (reservation) => reservation.event)
  reservations!: Reservation[];
}
