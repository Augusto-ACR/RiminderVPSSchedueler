import { ConfigService } from '@nestjs/config';

import { EventosRepository } from '../eventos/eventos.repository';
import { EventoDue } from '../eventos/eventos.types';
import { MensajeBuilder } from './mensaje.builder';
import { MensajeSender } from './mensaje-sender';
import { RecordatoriosService } from './recordatorios.service';
import { RecurrenciaService } from './recurrencia.service';

function eventoDue(over: Partial<EventoDue> = {}): EventoDue {
  return {
    id: 1,
    numero: '5491122334455',
    titulo: 'Reunión',
    fechaHoraUtc: '2026-06-19T18:00:00',
    descripcion: null,
    recurrencia: null,
    avisoMin: 0,
    ...over,
  };
}

describe('RecordatoriosService', () => {
  let repo: jest.Mocked<EventosRepository>;
  let sender: jest.Mocked<MensajeSender>;
  let builder: MensajeBuilder;
  let service: RecordatoriosService;

  beforeEach(() => {
    repo = {
      liberarStuck: jest.fn().mockResolvedValue(0),
      descartarVencidos: jest.fn().mockResolvedValue([]),
      claimDue: jest.fn().mockResolvedValue([]),
      marcarEnviado: jest.fn().mockResolvedValue(undefined),
      volverAPendiente: jest.fn().mockResolvedValue(undefined),
      reprogramar: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EventosRepository>;

    sender = { enviar: jest.fn().mockResolvedValue(true) };
    builder = { build: jest.fn().mockReturnValue('texto') } as unknown as MensajeBuilder;

    const config = { get: (_k: string, def: unknown) => def } as unknown as ConfigService;
    service = new RecordatoriosService(repo, builder, sender, new RecurrenciaService(), config);
  });

  it('envía y marca como enviado cuando el envío es exitoso', async () => {
    repo.claimDue.mockResolvedValue([eventoDue()]);

    const r = await service.procesarTick();

    expect(sender.enviar).toHaveBeenCalledWith('5491122334455', 'texto');
    expect(repo.marcarEnviado).toHaveBeenCalledWith(1);
    expect(repo.volverAPendiente).not.toHaveBeenCalled();
    expect(r).toEqual({ encontrados: 1, enviados: 1, fallidos: 0, descartados: 0 });
  });

  it('NO marca como enviado y vuelve a pendiente cuando el envío falla', async () => {
    repo.claimDue.mockResolvedValue([eventoDue()]);
    sender.enviar.mockResolvedValue(false);

    const r = await service.procesarTick();

    expect(repo.marcarEnviado).not.toHaveBeenCalled();
    expect(repo.volverAPendiente).toHaveBeenCalledWith(1);
    expect(r).toEqual({ encontrados: 1, enviados: 0, fallidos: 1, descartados: 0 });
  });

  it('vuelve a pendiente cuando el sender lanza una excepción', async () => {
    repo.claimDue.mockResolvedValue([eventoDue()]);
    sender.enviar.mockRejectedValue(new Error('OpenWA caído'));

    const r = await service.procesarTick();

    expect(repo.marcarEnviado).not.toHaveBeenCalled();
    expect(repo.volverAPendiente).toHaveBeenCalledWith(1);
    expect(r.fallidos).toBe(1);
  });

  it('cuenta los descartados por gracia y no los envía', async () => {
    repo.descartarVencidos.mockResolvedValue([
      { id: 9, numero: '549', fechaHoraUtc: '2026-06-19T10:00:00', recurrencia: null },
    ]);

    const r = await service.procesarTick();

    expect(sender.enviar).not.toHaveBeenCalled();
    expect(r.descartados).toBe(1);
  });

  it('libera los stuck antes de procesar', async () => {
    repo.liberarStuck.mockResolvedValue(2);

    await service.procesarTick();

    expect(repo.liberarStuck).toHaveBeenCalledWith(5);
  });

  it('un evento recurrente enviado se reprograma en vez de cerrarse', async () => {
    repo.claimDue.mockResolvedValue([
      eventoDue({ recurrencia: 'diaria', fechaHoraUtc: '2026-06-19T18:00:00' }),
    ]);

    const r = await service.procesarTick();

    expect(repo.reprogramar).toHaveBeenCalledWith(1, expect.any(String));
    expect(repo.marcarEnviado).not.toHaveBeenCalled();
    expect(r.enviados).toBe(1);
  });

  it('un recurrente vencido por gracia se reprograma (no se descarta seco)', async () => {
    repo.descartarVencidos.mockResolvedValue([
      { id: 7, numero: '549', fechaHoraUtc: '2026-06-19T10:00:00', recurrencia: 'semanal' },
    ]);

    await service.procesarTick();

    expect(repo.reprogramar).toHaveBeenCalledWith(7, expect.any(String));
  });
});
