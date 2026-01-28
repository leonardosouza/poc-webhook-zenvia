const request = require('supertest');
const { app } = require('../src/index');

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
    const res = await request(app)
      .post('/api/echo')
      .send(payload);
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
    const res = await request(app)
      .post('/webhook')
      .send(webhookPayload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Webhook recebido com sucesso');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('deve lidar com webhook vazio', async () => {
    const res = await request(app)
      .post('/webhook')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Webhook recebido com sucesso');
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
});
