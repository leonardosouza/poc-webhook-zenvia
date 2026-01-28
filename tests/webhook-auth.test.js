const request = require('supertest');
const crypto = require('node:crypto');

describe('Webhook com autenticação', () => {
  let app;
  const WEBHOOK_SECRET = 'test-webhook-secret';

  beforeAll(() => {
    jest.resetModules();
    process.env.WEBHOOK_SECRET = WEBHOOK_SECRET;
    const indexModule = require('../src/index');
    app = indexModule.app;
  });

  afterAll(() => {
    delete process.env.WEBHOOK_SECRET;
    jest.resetModules();
  });

  const generateSignature = (payload, secret) => {
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return `sha256=${hash}`;
  };

  it('deve retornar 401 para webhook sem assinatura', async () => {
    const res = await request(app).post('/webhook').send({ event: 'test' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Assinatura inválida');
  });

  it('deve retornar 401 para webhook com assinatura inválida', async () => {
    // Assinatura inválida mas com formato hex válido (64 caracteres hex)
    const invalidSignature = `sha256=${'a'.repeat(64)}`;
    const res = await request(app)
      .post('/webhook')
      .set('X-Hub-Signature-256', invalidSignature)
      .send({ event: 'test' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Assinatura inválida');
  });

  it('deve aceitar webhook com assinatura válida', async () => {
    const payload = { event: 'test', data: { id: 1 } };
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const res = await request(app)
      .post('/webhook')
      .set('X-Hub-Signature-256', signature)
      .send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Webhook recebido com sucesso');
  });

  it('deve aceitar webhook com header lowercase', async () => {
    const payload = { event: 'test' };
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const res = await request(app)
      .post('/webhook')
      .set('x-hub-signature-256', signature)
      .send(payload);
    expect(res.statusCode).toBe(200);
  });
});
