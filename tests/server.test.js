const http = require('http');

describe('Server Lifecycle', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve iniciar servidor em porta customizada', (done) => {
    jest.resetModules();
    process.env.PORT = '0'; // Porta 0 = sistema escolhe porta livre

    const { startServer } = require('../src/index');
    const server = startServer();

    server.on('listening', () => {
      const address = server.address();
      expect(address.port).toBeGreaterThan(0);
      server.close(done);
    });
  });

  it('deve executar graceful shutdown no SIGTERM', (done) => {
    jest.resetModules();
    process.env.PORT = '0';

    const originalExit = process.exit;
    process.exit = jest.fn();

    const { startServer } = require('../src/index');
    const server = startServer();

    server.on('listening', () => {
      process.emit('SIGTERM');

      setTimeout(() => {
        expect(process.exit).toHaveBeenCalledWith(0);
        process.exit = originalExit;
        done();
      }, 150);
    });
  });

  it('deve executar graceful shutdown no SIGINT', (done) => {
    jest.resetModules();
    process.env.PORT = '0';

    const originalExit = process.exit;
    process.exit = jest.fn();

    const { startServer } = require('../src/index');
    const server = startServer();

    server.on('listening', () => {
      process.emit('SIGINT');

      setTimeout(() => {
        expect(process.exit).toHaveBeenCalledWith(0);
        process.exit = originalExit;
        done();
      }, 150);
    });
  });
});
