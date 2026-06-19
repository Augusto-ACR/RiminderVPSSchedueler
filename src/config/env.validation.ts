import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum Entorno {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Esquema de las variables de entorno del scheduler.
 * Lo que NO lleva `@IsOptional()` es obligatorio: si falta, el proceso no arranca.
 */
export class EnvVars {
  @IsEnum(Entorno)
  @IsOptional()
  NODE_ENV: Entorno = Entorno.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  PORT = 3000;

  // Obligatoria: sin base de datos no hay scheduler.
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  TIMEZONE = 'America/Argentina/Buenos_Aires';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  SCHEDULER_GRACIA_MIN = 60;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  STUCK_TIMEOUT_MIN = 5;

  // Canal de envío: 'openwa' (real) o 'mock' (loguea, para probar sin WhatsApp).
  @IsIn(['openwa', 'mock'])
  @IsOptional()
  SENDER_DRIVER: 'openwa' | 'mock' = 'openwa';

  // OpenWA: OBLIGATORIAS si SENDER_DRIVER='openwa' (si faltan, el proceso no arranca, en vez
  // de "no avisar en silencio"). Cuando el driver es 'mock', se ignoran.
  // `require_tld: false` permite hostnames internos de Docker (ej: http://openwa-api:2785).
  @ValidateIf((o: EnvVars) => o.SENDER_DRIVER === 'openwa')
  @IsUrl({ require_tld: false })
  OPENWA_URL?: string;

  @ValidateIf((o: EnvVars) => o.SENDER_DRIVER === 'openwa')
  @IsString()
  @IsNotEmpty()
  OPENWA_API_KEY?: string;

  @ValidateIf((o: EnvVars) => o.SENDER_DRIVER === 'openwa')
  @IsString()
  @IsNotEmpty()
  OPENWA_SESSION_ID?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errores = validateSync(validated, { skipMissingProperties: false });

  if (errores.length > 0) {
    const detalle = errores
      .map((e) => ` - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Configuración de entorno inválida:\n${detalle}`);
  }

  return validated;
}
