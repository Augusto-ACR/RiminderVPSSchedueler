import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RecordatoriosService } from '../recordatorios/recordatorios.service';
import { TickStateService } from './tick-state.service';

/**
 * Dispara el ciclo del scheduler cada minuto y delega el trabajo en RecordatoriosService.
 * Solo se ocupa del temporizado y de evitar que dos ciclos se solapen.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly recordatorios: RecordatoriosService,
    private readonly tickState: TickStateService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    // Anti-solapamiento: si el ciclo anterior no terminó, salteamos este.
    if (this.isRunning) {
      this.logger.warn('Tick anterior aún en curso; se saltea este ciclo.');
      return;
    }

    this.isRunning = true;
    try {
      const { encontrados } = await this.recordatorios.procesarTick();
      this.tickState.registrarTick(encontrados);
    } catch (err) {
      this.logger.error(
        'Error en el tick del scheduler',
        err instanceof Error ? err.stack : String(err),
      );
    } finally {
      this.isRunning = false;
    }
  }
}
