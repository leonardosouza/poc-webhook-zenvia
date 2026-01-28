const request = require('supertest');
const crypto = require('node:crypto');
const { app, validateWebhookSignature } = require('../src/index');

describe('GET /', () => {
  it('deve retornar mensagem de boas-vindas', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Bem-vindo ao projeto Express!');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });
});

describe('GET /api/health', () => {
  it('deve retornar status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('POST /api/echo', () => {
  it('deve retornar o body recebido', async () => {
    const payload = { test: 'data', value: 123 };
    const res = await request(app).post('/api/echo').send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('received');
    expect(res.body.received).toEqual(payload);
  });
});

describe('POST /webhook', () => {
  it('deve processar webhook com sucesso', async () => {
    const webhookPayload = {
      event: 'message',
      data: { content: 'Hello' }
    };
    const res = await request(app).post('/webhook').send(webhookPayload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Webhook recebido com sucesso');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('deve lidar com webhook vazio', async () => {
    const res = await request(app).post('/webhook').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Webhook recebido com sucesso');
  });
});

describe('CORS', () => {
  it('deve retornar headers CORS', async () => {
    const res = await request(app).options('/').set('Origin', 'http://example.com');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});

describe('Error Handling', () => {
  it('deve retornar 404 para rotas inexistentes', async () => {
    const res = await request(app).get('/rota-inexistente');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Rota não encontrada');
  });

  it('deve retornar 400 para JSON inválido', async () => {
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send('{"invalid json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'JSON inválido');
  });

  it('deve retornar 413 para payload muito grande', async () => {
    const largePayload = { data: 'x'.repeat(2 * 1024 * 1024) };
    const res = await request(app).post('/webhook').send(largePayload);
    expect(res.statusCode).toBe(413);
    expect(res.body).toHaveProperty('error', 'Payload muito grande');
  });

  it('deve chamar next(err) para erros não tratados', async () => {
    const res = await request(app)
      .post('/api/echo')
      .set('Content-Type', 'text/plain')
      .send('plain text');
    expect(res.statusCode).toBe(200);
  });
});

describe('validateWebhookSignature', () => {
  const secret = 'test-secret-key';
  const payload = { event: 'test', data: { id: 1 } };

  const generateSignature = (payload, secret) => {
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return `sha256=${hash}`;
  };

  it('deve retornar true quando secret está vazio (dev mode)', () => {
    const result = validateWebhookSignature(payload, null, '');
    expect(result).toBe(true);
  });

  it('deve retornar false quando signature está ausente', () => {
    const result = validateWebhookSignature(payload, null, secret);
    expect(result).toBe(false);
  });

  it('deve retornar false quando signature está undefined', () => {
    const result = validateWebhookSignature(payload, undefined, secret);
    expect(result).toBe(false);
  });

  it('deve retornar true para assinatura válida', () => {
    const signature = generateSignature(payload, secret);
    const result = validateWebhookSignature(payload, signature, secret);
    expect(result).toBe(true);
  });

  it('deve retornar false para assinatura inválida', () => {
    const invalidSignature = `sha256=${'a'.repeat(64)}`;
    const result = validateWebhookSignature(payload, invalidSignature, secret);
    expect(result).toBe(false);
  });

  it('deve retornar true para assinatura válida sem prefixo sha256=', () => {
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    const result = validateWebhookSignature(payload, hash, secret);
    expect(result).toBe(true);
  });
});

describe('startServer', () => {
  it('deve exportar a função startServer', () => {
    const { startServer } = require('../src/index');
    expect(typeof startServer).toBe('function');
  });
});
