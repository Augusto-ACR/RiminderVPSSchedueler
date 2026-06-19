import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Filtro global: respuesta de error consistente y log con contexto (sin filtrar secretos). */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    // 4xx: devolvemos el detalle (útil para validación). 5xx: mensaje genérico, sin filtrar internals.
    const message =
      exception instanceof HttpException && status < HttpStatus.INTERNAL_SERVER_ERROR
        ? exception.getResponse()
        : 'Error interno del servidor';

    this.logger.error(
      `${req.method} ${req.url} -> ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    });
  }
}
