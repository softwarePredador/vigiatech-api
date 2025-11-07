/**
 * ML Service - Handles communication with ML analysis service
 * This can be either an external microservice or a local ML model
 */

class MLService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL;
    this.enabled = !!this.mlServiceUrl;
  }

  async analyzeVibration(data) {
    if (!this.enabled) {
      // If no ML service is configured, return a mock analysis
      return this.mockAnalysis(data);
    }

    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.mlServiceUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`ML Service responded with status ${response.status}`);
      }

      const analysis = await response.json();
      return analysis;
    } catch (error) {
      console.error('Error calling ML service:', error);
      // Fallback to mock analysis if ML service fails
      return this.mockAnalysis(data);
    }
  }

  /**
   * Mock ML analysis for development/testing
   * In production, this would be replaced by actual ML model predictions
   */
  mockAnalysis(data) {
    const { rms, peakFreq } = data;
    
    // Simple threshold-based analysis for demonstration
    let anomalyScore = 0;
    let status = 'normal';
    let probableCause = null;

    // Check RMS threshold
    if (rms > 1.2) {
      anomalyScore += 0.4;
    }

    // Check for specific frequency patterns
    if (peakFreq > 100 && peakFreq < 130) {
      anomalyScore += 0.3;
      probableCause = 'BF-001'; // Bearing failure
    }

    if (peakFreq > 50 && peakFreq < 70) {
      anomalyScore += 0.25;
      probableCause = 'MA-001'; // Misalignment
    }

    if (anomalyScore > 0.7) {
      status = 'alert';
    } else if (anomalyScore > 0.4) {
      status = 'warning';
    }

    // Calculate dominant harmonics
    const dominantHarmonics = [
      peakFreq * 2,
      peakFreq * 3
    ];

    return {
      machine_id: data.machineId,
      timestamp: new Date().toISOString(),
      status,
      anomalyScore,
      features: {
        rms_vibration: rms,
        peak_frequency: peakFreq,
        dominant_harmonics: dominantHarmonics
      },
      probable_cause_code: probableCause
    };
  }
}

module.exports = new MLService();
