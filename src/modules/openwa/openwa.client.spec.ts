import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

import { OpenwaClient } from './openwa.client';

function makeClient(over: Record<string, string | undefined> = {}) {
  const valores: Record<string, string | undefined> = {
    OPENWA_URL: 'http://openwa:2785',
    OPENWA_API_KEY: 'secreta',
    OPENWA_SESSION_ID: 'sesion1',
    ...over,
  };
  const config = {
    get: (k: string) => valores[k],
  } as unknown as ConfigService;
  const post = jest.fn().mockReturnValue(of({ status: 200, data: { ok: true } }));
  const http = { post } as unknown as HttpService;
  return { client: new OpenwaClient(http, config), post };
}

describe('OpenwaClient', () => {
  it('envía y arma el chatId con @c.us para un teléfono pelado', async () => {
    const { client, post } = makeClient();

    const ok = await client.enviar('5491122334455', 'hola');

    expect(ok).toBe(true);
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('http://openwa:2785/api/sessions/sesion1/messages/send-text');
    expect(body).toEqual({ chatId: '5491122334455@c.us', text: 'hola' });
  });

  it('respeta un jid @lid tal cual (no le pega @c.us)', async () => {
    const { client, post } = makeClient();

    await client.enviar('123456789@lid', 'hola');

    expect(post.mock.calls[0][1]).toEqual({ chatId: '123456789@lid', text: 'hola' });
  });

  it('no envía si el número tiene un formato inválido (ej: grupo @g.us)', async () => {
    const { client, post } = makeClient();

    const ok = await client.enviar('123456@g.us', 'hola');

    expect(ok).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('devuelve false y no llama a OpenWA si no está configurado', async () => {
    const { client, post } = makeClient({ OPENWA_API_KEY: undefined });

    const ok = await client.enviar('549112233', 'hola');

    expect(ok).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('devuelve false ante un status que no es 200/201', async () => {
    const { client } = makeClient();
    const post = jest.fn().mockReturnValue(of({ status: 500, data: 'boom' }));
    // Reemplazar el http del cliente recién creado
    (client as unknown as { http: { post: jest.Mock } }).http = { post };

    const ok = await client.enviar('549112233', 'hola');

    expect(ok).toBe(false);
  });
});
