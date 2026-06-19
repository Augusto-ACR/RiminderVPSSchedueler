import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Mapea la tabla `eventos` que dueña el agente Python (`synchronize: false`).
 *
 * El scheduler solo lee, y solo escribe las columnas de notificación (`notif_*`) y, en
 * recurrencia (Hito 4), `fecha_hora`/`notificado`. Las columnas del agente se declaran
 * para lectura tipada; NO se modifican desde acá.
 *
 * Nota: la ruta crítica (claim atómico) usa SQL parametrizado en EventosRepository, no el
 * repositorio de TypeORM. Esta entidad documenta el esquema y habilita lecturas tipadas.
 */
@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  numero!: string;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Index()
  @Column({ type: 'timestamp', name: 'fecha_hora' })
  fechaHora!: Date; // UTC naive

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurrencia!: string | null; // diaria | semanal | mensual | anual | null

  @Column({ type: 'integer', name: 'duracion_min', nullable: true })
  duracionMin!: number | null;

  @Column({ type: 'boolean', default: false })
  notificado!: boolean;

  // ── Columnas del scheduler (migración 001) ──
  @Column({ type: 'integer', name: 'aviso_min', default: 0 })
  avisoMin!: number;

  @Column({ type: 'varchar', length: 12, name: 'notif_estado', default: 'pendiente' })
  notifEstado!: 'pendiente' | 'enviando' | 'enviado' | 'descartado';

  @Column({ type: 'timestamp', name: 'notif_intento_at', nullable: true })
  notifIntentoAt!: Date | null;

  @Column({ type: 'timestamp', name: 'notif_enviado_at', nullable: true })
  notifEnviadoAt!: Date | null;
}
