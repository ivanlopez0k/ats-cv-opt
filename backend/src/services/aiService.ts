import OpenAI from 'openai';
import { config } from '../config/index.js';
import { CVAnalysisResult, CVImprovementResult } from '../types/index.js';
import http from 'http';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM_PROMPT_ANALYSIS = `Eres un experto en ATS (Applicant Tracking Systems) y optimización de CVs. 
Analiza el CV proporcionado y retorna SOLO un JSON válido con:
- score: número del 0-100 representando qué tan ATS-friendly es
- issues: array de problemas encontrados
- missingKeywords: keywords importantes que faltan para el puesto
- suggestions: array de sugerencias de mejora

No incluyas markdown ni texto adicional, solo el JSON.`;

const SYSTEM_PROMPT_IMPROVEMENT = `Eres un experto en ATS y optimización de CVs. 
Recibes un CV y debes mejorarlo manteniendo toda la información real.

IMPORTANTE: Responde EXCLUSIVAMENTE con un objeto JSON válido. 
- NO uses saltos de línea reales dentro de los strings.
- Si necesitas saltos de línea, usa \\n literal.
- NO incluyas markdown, bloques de código ni texto adicional.
- Solo el JSON crudo.

El JSON debe tener esta estructura:
- improvedText: string con el CV mejorado
- structuredCV: objeto con personalInfo, summary, experience, education, skills
- analysis: objeto con score, issues, missingKeywords, suggestions`;

/**
 * Generate mock analysis/improvement for development without OpenAI credits.
 */
function generateMockAnalysis(cvText: string, targetJob?: string, targetIndustry?: string): CVImprovementResult {
  const score = Math.floor(Math.random() * 60) + 40; // Random 40-99

  const allIssues = [
    'Falta cuantificar logros con métricas específicas',
    'Sección de skills poco detallada',
    'Formato no optimizado para ATS',
    'Faltan palabras clave del sector',
    'Experiencia sin verbos de acción',
    'Resumen profesional demasiado genérico',
    'Falta sección de certificaciones',
    'Orden cronológico inconsistente',
  ];

  const allKeywords = [
    'Liderazgo', 'Gestión de proyectos', 'Comunicación efectiva',
    'Trabajo en equipo', 'Resolución de problemas', 'Pensamiento crítico',
    'Adaptabilidad', 'Gestión del tiempo', 'Negociación',
    'Análisis de datos', 'Metodologías ágiles', 'Inglés avanzado',
  ];

  const allSuggestions = [
    'Agregar métricas y números a los logros',
    'Incluir certificaciones relevantes',
    'Usar verbos de acción al inicio de cada bullet point',
    'Optimizar el formato para compatibilidad ATS',
    'Personalizar el resumen para el puesto objetivo',
    'Agregar sección de proyectos o portfolio',
    'Incluir habilidades blandas con ejemplos concretos',
  ];

  // Pick random items
  const issues = allIssues.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2);
  const missingKeywords = allKeywords.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 3);
  if (targetJob && !missingKeywords.includes(targetJob)) missingKeywords.unshift(targetJob);
  const suggestions = allSuggestions.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 2);

  return {
    improvedText: `# CV Optimizado para ATS - ${targetJob || 'Profesional'}\n\n${cvText}\n\n---\n*Versión mejorada por CVMaster AI (modo desarrollo)*`,
    structuredCV: {
      personalInfo: { name: 'Nombre del candidato' },
      summary: 'Profesional con experiencia relevante',
      experience: [{ title: 'Puesto anterior', company: 'Empresa', duration: '2020-2024', achievements: ['Logro 1', 'Logro 2'] }],
      education: [{ degree: 'Título', institution: 'Universidad', year: '2020' }],
      skills: ['Habilidad 1', 'Habilidad 2', targetJob || 'General'].filter(Boolean),
    },
    analysis: { score, issues, missingKeywords, suggestions },
  };
}

/**
 * Call Ollama local API directly (no extra dependency needed).
 */
async function callOllama(prompt: string): Promise<string> {
  const body = JSON.stringify({
    model: config.ollama.model,
    prompt,
    stream: false,
    options: {
      temperature: 0.3,
      num_ctx: 8192,
    },
  });

  const url = new URL(config.ollama.baseUrl);

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 600_000, // 10 min timeout for local models
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response || '');
          } catch {
            reject(new Error(`Ollama response parse error: ${data.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama request timed out'));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Try to extract JSON from a response that might contain markdown code blocks.
 */
function extractJson(text: string): any {
  // Strip markdown code block wrapper
  let cleaned = text.trim();
  const mdMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (mdMatch) cleaned = mdMatch[1].trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // Try to fix unescaped newlines within JSON string values
  // This handles the case where local models output actual newlines inside strings
  try {
    // Escape unescaped newlines within string values
    const fixed = cleaned
      .replace(/(?<=")([\s\S]*?)(?=")/g, (match) => {
        // Only escape newlines that are inside string values
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      });
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Try to find anything that looks like a JSON object
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch { /* continue */ }
  }

  throw new Error(`Could not extract valid JSON from AI response. Raw output (first 500 chars): ${cleaned.slice(0, 500)}`);
}

export const aiService = {
  async analyzeCV(cvText: string, targetJob?: string, targetIndustry?: string): Promise<CVAnalysisResult> {
    // Mode 1: Ollama (local, free)
    if (config.ollama.enabled) {
      console.log(`🦙 Using Ollama (${config.ollama.model}) for analysis`);
      const prompt = `${SYSTEM_PROMPT_ANALYSIS}\n\nCV a analizar:\n${cvText}\n\n${targetJob ? `Puesto objetivo: ${targetJob}` : ''}${targetIndustry ? `Industria: ${targetIndustry}` : ''}`;
      const response = await callOllama(prompt);
      return extractJson(response) as CVAnalysisResult;
    }

    // Mode 2: Mock (dev, no API needed)
    if (config.openai.mockEnabled) {
      console.log('🎭 Using mock AI analysis (development mode)');
      const mock = generateMockAnalysis(cvText, targetJob, targetIndustry);
      return mock.analysis;
    }

    // Mode 3: OpenAI (production)
    const userPrompt = `
CV a analizar:
${cvText}

${targetJob ? `Puesto objetivo: ${targetJob}` : ''}
${targetIndustry ? `Industria: ${targetIndustry}` : ''}

Responde SOLO con JSON válido, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_ANALYSIS },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as CVAnalysisResult;
  },

  async improveCV(cvText: string, targetJob?: string, targetIndustry?: string): Promise<CVImprovementResult> {
    // Mode 1: Ollama (local, free)
    if (config.ollama.enabled) {
      console.log(`🦙 Using Ollama (${config.ollama.model}) for improvement`);
      const prompt = `${SYSTEM_PROMPT_IMPROVEMENT}\n\nCV a mejorar:\n${cvText}\n\n${targetJob ? `Puesto objetivo: ${targetJob}` : ''}${targetIndustry ? `Industria: ${targetIndustry}` : ''}`;
      const response = await callOllama(prompt);
      return extractJson(response) as CVImprovementResult;
    }

    // Mode 2: Mock (dev, no API needed)
    if (config.openai.mockEnabled) {
      console.log('🎭 Using mock AI improvement (development mode)');
      return generateMockAnalysis(cvText, targetJob, targetIndustry);
    }

    // Mode 3: OpenAI (production)
    const userPrompt = `
CV a mejorar:
${cvText}

${targetJob ? `Puesto objetivo: ${targetJob}` : ''}
${targetIndustry ? `Industria: ${targetIndustry}` : ''}

Responde SOLO con JSON válido, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_IMPROVEMENT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as CVImprovementResult;
  },
};
