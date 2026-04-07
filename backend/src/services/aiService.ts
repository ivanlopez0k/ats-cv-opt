import OpenAI from 'openai';
import { config } from '../config/index.js';
import { CVAnalysisResult, CVImprovementResult } from '../types/index.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM_PROMPT_ANALYSIS = `Eres un experto en ATS (Applicant Tracking Systems) y optimización de CVs. 
Analiza el CV proporcionado y retorna un JSON con:
- score: número del 0-100 representando qué tan ATS-friendly es
- issues: array de problemas encontrados
- missingKeywords: keywords importantes que faltan para el puesto
- suggestions: array de sugerencias de mejora`;

const SYSTEM_PROMPT_IMPROVEMENT = `Eres un experto en ATS y optimización de CVs. 
Recibes un CV y debes mejorarlo manteniendo toda la información real.
Retorna un JSON con:
- improvedText: texto del CV mejorado (formato limpio para PDF)
- structuredCV: objeto con la estructura del CV
- analysis: objeto con score, issues, missingKeywords, suggestions`;

export const aiService = {
  async analyzeCV(cvText: string, targetJob?: string, targetIndustry?: string): Promise<CVAnalysisResult> {
    const userPrompt = `
CV a analizar:
${cvText}

${targetJob ? `Puesto objetivo: ${targetJob}` : ''}
${targetIndustry ? `Industria: ${targetIndustry}` : ''}

Responde SOLO con JSON válido, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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
    const userPrompt = `
CV a mejorar:
${cvText}

${targetJob ? `Puesto objetivo: ${targetJob}` : ''}
${targetIndustry ? `Industria: ${targetIndustry}` : ''}

Responde SOLO con JSON válido, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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
