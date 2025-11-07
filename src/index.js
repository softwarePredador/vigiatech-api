require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log('🚀 Iniciando VigiatTech API...');
console.log('📦 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');

// Import routes with error handling
let authRoutes, machineRoutes, alertRoutes, ingestionRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  machineRoutes = require('./routes/machineRoutes');
  alertRoutes = require('./routes/alertRoutes');
  ingestionRoutes = require('./routes/ingestionRoutes');
  console.log('✅ Routes carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar routes:', error.message);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ingest', ingestionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VigiatTech API - Sistema de Monitoramento de Vibração IoT',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      machines: '/api/machines',
      alerts: '/api/alerts',
      ingest: '/api/ingest'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro na aplicação:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           VigiatTech API - Sistema de Vibração           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Servidor rodando na porta ${port}
🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
📊 Database: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}
🤖 ML Service: ${process.env.ML_SERVICE_URL || 'Mock mode (desenvolvimento)'}
🧠 LLM Service: ${process.env.OPENAI_API_KEY ? 'OpenAI' : process.env.GEMINI_API_KEY ? 'Gemini' : 'Mock mode (desenvolvimento)'}

Endpoints disponíveis:
  - GET  /health
  - POST /api/auth/register
  - POST /api/auth/login
  - GET  /api/auth/me
  - GET  /api/machines
  - POST /api/machines
  - GET  /api/machines/:id
  - PUT  /api/machines/:id
  - DELETE /api/machines/:id
  - GET  /api/machines/:id/vibration-data
  - GET  /api/alerts
  - GET  /api/alerts/:id
  - PUT  /api/alerts/:id/resolve
  - POST /api/ingest/vibration
  `);
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📝 SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📝 SIGINT recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  });
});

module.exports = app;
