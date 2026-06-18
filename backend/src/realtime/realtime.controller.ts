import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { map, Observable } from 'rxjs';

import { RealtimeService } from './realtime.service';

@SkipThrottle()
@Controller('events')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.realtimeService.getEventsStream().pipe(
      map((message) => ({
        data: message,
      })),
    );
  }
}