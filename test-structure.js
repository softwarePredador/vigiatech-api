#!/usr/bin/env node

/**
 * Dry-run test to verify API structure without database
 */

console.log('🧪 Testing VigiatTech API structure...\n');

// Test 1: Verify all required modules can be loaded
console.log('📦 Testing module imports...');
try {
  require('express');
  console.log('  ✓ Express.js loaded');
  
  require('cors');
  console.log('  ✓ CORS loaded');
  
  require('bcryptjs');
  console.log('  ✓ bcryptjs loaded');
  
  require('jsonwebtoken');
  console.log('  ✓ jsonwebtoken loaded');
  
  require('@prisma/client');
  console.log('  ✓ Prisma Client loaded');
} catch (error) {
  console.error('  ✗ Module load failed:', error.message);
  process.exit(1);
}

// Test 2: Verify services can be imported
console.log('\n🔧 Testing service imports...');
try {
  const mlService = require('./src/services/mlService');
  console.log('  ✓ ML Service loaded');
  console.log(`    - Mode: ${mlService.enabled ? 'External' : 'Mock'}`);
  
  const llmService = require('./src/services/llmService');
  console.log('  ✓ LLM Service loaded');
  console.log(`    - Provider: ${llmService.provider || 'Mock'}`);
} catch (error) {
  console.error('  ✗ Service load failed:', error.message);
  process.exit(1);
}

// Test 3: Verify controllers can be imported
console.log('\n🎮 Testing controller imports...');
try {
  require('./src/controllers/authController');
  console.log('  ✓ Auth Controller loaded');
  
  require('./src/controllers/machineController');
  console.log('  ✓ Machine Controller loaded');
  
  require('./src/controllers/alertController');
  console.log('  ✓ Alert Controller loaded');
  
  require('./src/controllers/ingestionController');
  console.log('  ✓ Ingestion Controller loaded');
} catch (error) {
  console.error('  ✗ Controller load failed:', error.message);
  process.exit(1);
}

// Test 4: Verify routes can be imported
console.log('\n🛣️  Testing route imports...');
try {
  require('./src/routes/authRoutes');
  console.log('  ✓ Auth Routes loaded');
  
  require('./src/routes/machineRoutes');
  console.log('  ✓ Machine Routes loaded');
  
  require('./src/routes/alertRoutes');
  console.log('  ✓ Alert Routes loaded');
  
  require('./src/routes/ingestionRoutes');
  console.log('  ✓ Ingestion Routes loaded');
} catch (error) {
  console.error('  ✗ Route load failed:', error.message);
  process.exit(1);
}

// Test 5: Test ML Service mock analysis
console.log('\n🤖 Testing ML Service mock analysis...');
try {
  const mlService = require('./src/services/mlService');
  const testData = {
    machineId: 1,
    rms: 1.3,
    peakFreq: 120.5
  };
  
  const analysis = mlService.mockAnalysis(testData);
  console.log('  ✓ Mock analysis executed');
  console.log(`    - Status: ${analysis.status}`);
  console.log(`    - Anomaly Score: ${analysis.anomalyScore.toFixed(2)}`);
  console.log(`    - Probable Cause: ${analysis.probable_cause_code || 'None'}`);
} catch (error) {
  console.error('  ✗ ML Service test failed:', error.message);
  process.exit(1);
}

// Test 6: Test LLM Service mock diagnostic
console.log('\n🧠 Testing LLM Service mock diagnostic...');
try {
  const llmService = require('./src/services/llmService');
  const mlService = require('./src/services/mlService');
  
  const machineData = {
    name: 'Test Machine',
    type: 'Compressor',
    lastMaintenance: new Date('2025-05-01')
  };
  
  const mlAnalysis = {
    status: 'alert',
    anomalyScore: 0.92,
    features: {
      rms_vibration: 1.25,
      peak_frequency: 120.5,
      dominant_harmonics: [241, 361.5]
    },
    probable_cause_code: 'MA-001'
  };
  
  const diagnostic = llmService.mockDiagnostic(machineData, mlAnalysis);
  console.log('  ✓ Mock diagnostic generated');
  console.log(`    - Status: ${diagnostic.status}`);
  console.log(`    - Info length: ${diagnostic.information.length} chars`);
} catch (error) {
  console.error('  ✗ LLM Service test failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed! API structure is valid.\n');
console.log('📝 Next steps:');
console.log('   1. Set up PostgreSQL database');
console.log('   2. Configure DATABASE_URL in .env');
console.log('   3. Run: npm run prisma:migrate');
console.log('   4. Run: npm start');
console.log('');
