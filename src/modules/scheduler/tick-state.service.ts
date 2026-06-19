import { Injectable } from '@nestjs/common';

/** Estado en memoria del último tick, para que /health pueda reportar liveness del cron. */
@Injectable()
export class TickStateService {
  lastTickAt: Date | null = null;
  lastTickFound = 0;

  registrarTick(found: number): void {
    this.lastTickAt = new Date();
    this.lastTickFound = found;
  }
}
