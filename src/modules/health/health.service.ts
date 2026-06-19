import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../../database/database.module';
import { TickStateService } from '../scheduler/tick-state.service';

export interface HealthReport {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
  lastTickAt: string | null;
  lastTickFound: number;
}

@Injectable()
export class HealthService {
  // No martillar la reconexión: si la BD está caída, se reintenta como mucho cada N ms.
  private static readonly RECONEXION_MIN_MS = 10_000;
  private ultimoIntentoReconexion = 0;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly tickState: TickStateService,
  ) {}

  async check(): Promise<HealthReport> {
    let db: 'up' | 'down' = 'down';
    try {
      if (!this.dataSource.isInitialized) {
        const ahora = Date.now();
        if (ahora - this.ultimoIntentoReconexion < HealthService.RECONEXION_MIN_MS) {
          // Reconexión en cooldown: reportamos down sin reintentar (evita fuga de conexiones).
          return this.reporte('down');
        }
        this.ultimoIntentoReconexion = ahora;
        await this.dataSource.initialize();
      }
      await this.dataSource.query('SELECT 1');
      db = 'up';
    } catch {
      db = 'down';
    }

    return this.reporte(db);
  }

  private reporte(db: 'up' | 'down'): HealthReport {
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      lastTickAt: this.tickState.lastTickAt?.toISOString() ?? null,
      lastTickFound: this.tickState.lastTickFound,
    };
  }
}
