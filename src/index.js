const express = require('express');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware para parsear JSON
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao projeto Express!',
    version: '1.0.0'
  });
});

// Rota de exemplo
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rota POST de exemplo
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body
  });
});

// Rota de webhook
app.post('/webhook', (req, res) => {
  // Capturar origin considerando proxy (ngrok)
  const origin = req.get('X-Forwarded-For') || 
                 req.get('x-forwarded-for') || 
                 req.get('origin') || 
                 req.ip || 
                 'unknown';
  
  const protocol = req.get('X-Forwarded-Proto') || 
                   req.get('x-forwarded-proto') || 
                   req.protocol;
  
  const host = req.get('X-Forwarded-Host') || 
               req.get('x-forwarded-host') || 
               req.get('host');
  
  console.log('\n=== Webhook Recebido ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL Original:', `${protocol}://${host}${req.originalUrl}`);
  console.log('Origin/IP:', origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('=======================\n');
  
  res.status(200).json({
    message: 'Webhook recebido com sucesso',
    timestamp: new Date().toISOString(),
    origin: origin,
    url: `${protocol}://${host}${req.originalUrl}`
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
