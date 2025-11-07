require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const machineRoutes = require('./routes/machineRoutes');
const alertRoutes = require('./routes/alertRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');

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
app.listen(port, () => {
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
});

module.exports = app;
