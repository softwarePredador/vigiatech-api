const prisma = require('../config/database');
const mlService = require('../services/mlService');
const llmService = require('../services/llmService');

class IngestionController {
  async ingestVibration(req, res) {
    try {
      const { machineId, vibrationData, timestamp } = req.body;

      // Validate input
      if (!machineId || !vibrationData) {
        return res.status(400).json({ error: 'machineId e vibrationData são obrigatórios' });
      }

      // Verify machine exists
      const machine = await prisma.machine.findUnique({
        where: { id: parseInt(machineId) }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      // Extract vibration metrics from data
      const { rms, peakFreq, amplitude, xAxis, yAxis, zAxis, rawData } = vibrationData;

      // Save vibration data to database
      const savedData = await prisma.vibrationData.create({
        data: {
          machineId: parseInt(machineId),
          rms: parseFloat(rms),
          peakFreq: parseFloat(peakFreq),
          amplitude: amplitude ? parseFloat(amplitude) : null,
          xAxis: xAxis ? parseFloat(xAxis) : null,
          yAxis: yAxis ? parseFloat(yAxis) : null,
          zAxis: zAxis ? parseFloat(zAxis) : null,
          rawData: rawData || null,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        }
      });

      console.log(`Dados de vibração recebidos da Machine ${machineId}:`, {
        rms,
        peakFreq,
        timestamp: savedData.timestamp
      });

      // Asynchronously analyze the data with ML (don't wait for response)
      this.analyzeVibrationAsync(machineId, savedData, machine).catch(error => {
        console.error('Erro na análise assíncrona:', error);
      });

      // Return success immediately
      return res.status(202).json({
        message: 'Dados recebidos e sendo processados',
        dataId: savedData.id
      });
    } catch (error) {
      console.error('Ingest vibration error:', error);
      return res.status(500).json({ error: 'Erro ao processar dados de vibração' });
    }
  }

  async analyzeVibrationAsync(machineId, vibrationData, machine) {
    try {
      // Call ML service for analysis
      const mlAnalysis = await mlService.analyzeVibration({
        machineId,
        rms: vibrationData.rms,
        peakFreq: vibrationData.peakFreq,
        amplitude: vibrationData.amplitude,
        xAxis: vibrationData.xAxis,
        yAxis: vibrationData.yAxis,
        zAxis: vibrationData.zAxis
      });

      console.log('Análise ML:', mlAnalysis);

      // If anomaly detected, generate alert with LLM
      if (mlAnalysis.status === 'alert' || mlAnalysis.anomalyScore > 0.7) {
        const llmResponse = await llmService.generateDiagnostic({
          machineData: machine,
          mlAnalysis,
          vibrationData
        });

        // Save alert to database
        const alert = await prisma.alert.create({
          data: {
            machineId: parseInt(machineId),
            severity: this.determineSeverity(mlAnalysis.anomalyScore),
            status: llmResponse.status,
            information: llmResponse.information,
            anomalyScore: mlAnalysis.anomalyScore,
            mlFeatures: mlAnalysis.features || {}
          }
        });

        // Update machine status
        await prisma.machine.update({
          where: { id: parseInt(machineId) },
          data: { status: 'alert' }
        });

        console.log(`Alerta criado para Machine ${machineId}:`, alert.id);

        // TODO: Send push notification to user
        // await notificationService.sendAlert(machine.userId, alert);
      }
    } catch (error) {
      console.error('Erro na análise assíncrona:', error);
      throw error;
    }
  }

  determineSeverity(anomalyScore) {
    if (anomalyScore >= 0.9) return 'critical';
    if (anomalyScore >= 0.7) return 'high';
    if (anomalyScore >= 0.5) return 'medium';
    return 'low';
  }
}

module.exports = new IngestionController();
