import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface EventTicketsUpdatedPayload {
  eventId: string;
  availableTickets: number;
}

export interface RealtimeMessage<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

@Injectable()
export class RealtimeService {
  private readonly eventsSubject = new Subject<RealtimeMessage>();

  getEventsStream(): Observable<RealtimeMessage> {
    return this.eventsSubject.asObservable();
  }

  emitEventTicketsUpdated(payload: EventTicketsUpdatedPayload): void {
    this.eventsSubject.next({
      type: 'EVENT_TICKETS_UPDATED',
      payload,
    });
  }
}
