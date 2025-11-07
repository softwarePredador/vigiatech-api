/**
 * LLM Service - Integrates with OpenAI or Google Gemini to generate
 * human-readable diagnostics from ML analysis results
 */

class LLMService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.enabled = !!(this.openaiKey || this.geminiKey);
    this.provider = this.openaiKey ? 'openai' : this.geminiKey ? 'gemini' : null;
  }

  async generateDiagnostic({ machineData, mlAnalysis, vibrationData }) {
    if (!this.enabled) {
      // Return mock response if no LLM is configured
      return this.mockDiagnostic(machineData, mlAnalysis);
    }

    try {
      const prompt = this.buildPrompt(machineData, mlAnalysis, vibrationData);
      
      if (this.provider === 'openai') {
        return await this.callOpenAI(prompt);
      } else if (this.provider === 'gemini') {
        return await this.callGemini(prompt);
      }
      
      return this.mockDiagnostic(machineData, mlAnalysis);
    } catch (error) {
      console.error('Error calling LLM service:', error);
      // Fallback to mock if LLM fails
      return this.mockDiagnostic(machineData, mlAnalysis);
    }
  }

  buildPrompt(machineData, mlAnalysis, vibrationData) {
    const maintenanceDays = machineData.lastMaintenance 
      ? Math.floor((Date.now() - new Date(machineData.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24))
      : 'Desconhecida';

    return `Você é um engenheiro de manutenção preditiva sênior. Um alerta foi gerado para a máquina '${machineData.name}'.

Dados Técnicos (do modelo de ML):
- Status: ${mlAnalysis.status}
- Score de Anomalia: ${mlAnalysis.anomalyScore.toFixed(2)}
- RMS de Vibração: ${mlAnalysis.features.rms_vibration.toFixed(2)}
- Frequência de Pico: ${mlAnalysis.features.peak_frequency.toFixed(1)} Hz
- Harmônicas Dominantes: ${mlAnalysis.features.dominant_harmonics.join(', ')} Hz

Contexto Adicional:
- Tipo de Máquina: ${machineData.type || 'Não especificado'}
- Última Manutenção: ${maintenanceDays === 'Desconhecida' ? 'Desconhecida' : `${maintenanceDays} dias atrás`}

Com base nesses dados, gere uma resposta em formato JSON com dois campos:
1. "status": Um título curto e claro do problema (ex: "Vibração elevada detectada (Desalinhamento)")
2. "information": Uma explicação detalhada do problema, a causa provável e recomendações de ação

Responda APENAS com o JSON, sem texto adicional.`;
  }

  async callOpenAI(prompt) {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em manutenção preditiva industrial. Responda sempre em português brasileiro.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch {
        // If not JSON, format the response
        return {
          status: 'Alerta de Vibração',
          information: content
        };
      }
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async callGemini(prompt) {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch {
        // If not JSON, format the response
        return {
          status: 'Alerta de Vibração',
          information: content
        };
      }
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  mockDiagnostic(machineData, mlAnalysis) {
    const { anomalyScore, features, probable_cause_code } = mlAnalysis;
    
    let status = 'Vibração elevada detectada';
    let information = `A vibração geral excedeu o limite normal.`;

    if (probable_cause_code === 'BF-001') {
      status = 'Vibração elevada detectada (Falha de Rolamento)';
      information = `Detectamos um pico forte em ${features.peak_frequency.toFixed(1)}Hz e suas harmônicas (${features.dominant_harmonics[0].toFixed(1)}Hz, ${features.dominant_harmonics[1].toFixed(1)}Hz), o que é um indicador clássico de falha de rolamento. O valor RMS de ${features.rms_vibration.toFixed(2)} está acima do normal. Recomendamos inspeção e possível substituição do rolamento.`;
    } else if (probable_cause_code === 'MA-001') {
      status = 'Vibração elevada detectada (Desalinhamento)';
      information = `Detectamos um pico forte em ${features.peak_frequency.toFixed(1)}Hz e suas harmônicas, o que é um indicador clássico de desalinhamento do eixo. A vibração RMS de ${features.rms_vibration.toFixed(2)} está elevada.`;
      
      if (machineData.lastMaintenance) {
        const days = Math.floor((Date.now() - new Date(machineData.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24));
        information += ` A última manutenção foi há ${days} dias. Recomendamos agendar uma inspeção para alinhamento a laser.`;
      } else {
        information += ` Recomendamos agendar uma inspeção para alinhamento a laser.`;
      }
    }

    return { status, information };
  }
}

module.exports = new LLMService();
