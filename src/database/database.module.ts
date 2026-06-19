import { join } from 'path';

import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

/** Token de inyección del DataSource compartido. */
export const DATA_SOURCE = 'DATA_SOURCE';

/**
 * Provee el DataSource de TypeORM SIN frenar el arranque si Postgres está caído.
 *
 * Por qué no `TypeOrmModule.forRoot`: su conexión es bloqueante en el boot y, si la BD
 * no está, el proceso muere. Para un scheduler 24/7 preferimos arrancar igual, reportar
 * `db: down` en /health y reconectar on-demand (cada tick / cada health check).
 *
 * El esquema de `eventos` lo dueña el agente Python: `synchronize: false` SIEMPRE.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATA_SOURCE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<DataSource> => {
        const logger = new Logger('DatabaseModule');
        const dataSource = new DataSource({
          type: 'postgres',
          url: config.getOrThrow<string>('DATABASE_URL'),
          synchronize: false,
          // Autodescubre las entidades (*.entity.ts/js) sin tener que listarlas a mano.
          entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
          logging: ['error'],
        });

        try {
          await dataSource.initialize();
          logger.log('Conectado a Postgres.');
        } catch (err) {
          logger.error(
            'No se pudo conectar a Postgres al arrancar; se reintentará en uso.',
            err instanceof Error ? err.message : String(err),
          );
        }

        return dataSource;
      },
    },
  ],
  exports: [DATA_SOURCE],
})
export class DatabaseModule {}
