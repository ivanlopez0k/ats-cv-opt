/**
 * HTML Template Service for CV generation.
 * Renders structured CV data into professional HTML templates.
 */

import { CVImprovementResult } from '../types/index.js';
import { sanitizeHtml } from '../utils/sanitize.js';

export interface CVTemplateOptions {
  template?: 'modern' | 'classic' | 'minimal';
  accentColor?: string;
}

/**
 * Modern 2-column CV template with professional design.
 */
function modernTemplate(cv: CVImprovementResult, accentColor: string): string {
  const { improvedText, structuredCV, analysis } = cv;

  // Parse the improved text into sections
  const sections = parseCVSections(improvedText);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${structuredCV.personalInfo.name || 'Candidato'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      background: #f8f9fa;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    /* Header */
    .cv-header {
      background: ${accentColor};
      color: white;
      padding: 32px 40px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: center;
    }
    
    .cv-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .cv-header .subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 400;
    }
    
    .cv-contact {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      font-size: 12px;
    }
    
    .cv-contact span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    /* Main content grid */
    .cv-main {
      display: grid;
      grid-template-columns: 1fr 280px;
      min-height: 600px;
    }
    
    /* Left column */
    .cv-left {
      padding: 28px 32px;
      border-right: 1px solid #e9ecef;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${accentColor};
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid ${accentColor};
    }
    
    .experience-item {
      margin-bottom: 16px;
    }
    
    .experience-item h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .experience-item .company {
      font-size: 13px;
      color: #495057;
      margin-bottom: 6px;
    }
    
    .experience-item ul {
      margin-left: 16px;
      font-size: 12px;
      color: #495057;
    }
    
    .experience-item li {
      margin-bottom: 4px;
    }
    
    /* Right column */
    .cv-right {
      padding: 28px 24px;
      background: #f8f9fa;
    }
    
    .skill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .skill-tag {
      background: white;
      border: 1px solid #dee2e6;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      color: #495057;
    }
    
    .education-item {
      margin-bottom: 12px;
    }
    
    .education-item h4 {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .education-item p {
      font-size: 11px;
      color: #6c757d;
    }
    
    .summary-text {
      font-size: 12px;
      color: #495057;
      line-height: 1.6;
    }
    
    /* ATS Score badge */
    .ats-badge {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .ats-badge .score {
      font-size: 32px;
      font-weight: 700;
      color: ${getScoreColor(analysis.score)};
    }
    
    .ats-badge .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6c757d;
    }
    
    /* Footer */
    .cv-footer {
      padding: 12px 32px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      text-align: center;
      font-size: 10px;
      color: #adb5bd;
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- Header -->
    <div class="cv-header">
      <div>
        <h1>${structuredCV.personalInfo.name || 'Nombre del Candidato'}</h1>
        <div class="subtitle">${sections.title || 'Full Stack Developer'}</div>
      </div>
      <div class="cv-contact">
        ${structuredCV.personalInfo.email ? `<span>📧 ${structuredCV.personalInfo.email}</span>` : ''}
        ${structuredCV.personalInfo.phone ? `<span>📱 ${structuredCV.personalInfo.phone}</span>` : ''}
        ${structuredCV.personalInfo.location ? `<span>📍 ${structuredCV.personalInfo.location}</span>` : ''}
        ${structuredCV.personalInfo.linkedin ? `<span>🔗 ${structuredCV.personalInfo.linkedin}</span>` : ''}
      </div>
    </div>
    
    <!-- Main content -->
    <div class="cv-main">
      <!-- Left column -->
      <div class="cv-left">
        ${sections.summary ? `
        <div class="section">
          <div class="section-title">Perfil Profesional</div>
          <p class="summary-text">${sections.summary}</p>
        </div>
        ` : ''}
        
        ${sections.experience ? `
        <div class="section">
          <div class="section-title">Experiencia Profesional</div>
          ${sections.experience.map((exp: any) => `
          <div class="experience-item">
            <h3>${exp.title || 'Desarrollador'}</h3>
            <div class="company">${exp.company || 'Empresa'} ${exp.duration ? `| ${exp.duration}` : ''}</div>
            ${exp.achievements ? `<ul>${exp.achievements.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : ''}
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${sections.projects ? `
        <div class="section">
          <div class="section-title">Proyectos</div>
          ${sections.projects.map((p: any) => `
          <div class="experience-item">
            <h3>${p.name || 'Proyecto'}</h3>
            <div class="company">${p.description || ''}</div>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      
      <!-- Right column -->
      <div class="cv-right">
        <!-- Skills -->
        ${structuredCV.skills && structuredCV.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Habilidades</div>
          <div class="skill-list">
            ${structuredCV.skills.map((s: string) => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Education -->
        ${structuredCV.education && structuredCV.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Educación</div>
          ${structuredCV.education.map((edu: any) => `
          <div class="education-item">
            <h4>${edu.degree || 'Título'}</h4>
            <p>${edu.institution || 'Institución'} ${edu.year ? `| ${edu.year}` : ''}</p>
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Certifications -->
        ${sections.certifications ? `
        <div class="section">
          <div class="section-title">Certificaciones</div>
          ${sections.certifications.map((c: string) => `
          <div class="education-item">
            <h4>${c}</h4>
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Languages -->
        ${sections.languages ? `
        <div class="section">
          <div class="section-title">Idiomas</div>
          ${sections.languages.map((lang: any) => `
          <div class="education-item">
            <h4>${lang.name || 'Idioma'} - ${lang.level || 'Básico'}</h4>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    
    <!-- Footer -->
    <div class="cv-footer">
      CV optimizado con IA por CVMaster · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Classic single-column CV template.
 */
function classicTemplate(cv: CVImprovementResult): string {
  const { improvedText, structuredCV, analysis } = cv;
  const sections = parseCVSections(improvedText);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CV - ${structuredCV.personalInfo.name || 'Candidato'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Source+Sans+Pro:wght@400;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Source Sans Pro', sans-serif;
      color: #2c3e50;
      line-height: 1.6;
      max-width: 210mm;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-family: 'Merriweather', serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 12px;
    }
    
    .contact {
      font-size: 13px;
      color: #555;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-family: 'Merriweather', serif;
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    
    .experience-item {
      margin-bottom: 16px;
    }
    
    .experience-item h3 {
      font-size: 15px;
      font-weight: 600;
    }
    
    .experience-item .meta {
      font-size: 13px;
      color: #7f8c8d;
      margin-bottom: 6px;
    }
    
    .experience-item ul {
      margin-left: 20px;
      font-size: 13px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-item {
      background: #ecf0f1;
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 12px;
    }
    
    .ats-badge {
      text-align: center;
      background: #ecf0f1;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    
    .ats-badge .score {
      font-size: 28px;
      font-weight: 700;
      color: #27ae60;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${structuredCV.personalInfo.name || 'Nombre del Candidato'}</h1>
    <div class="subtitle">${sections.title || 'Desarrollador Full Stack'}</div>
    <div class="contact">
      ${structuredCV.personalInfo.email || ''} ${structuredCV.personalInfo.phone ? `· ${structuredCV.personalInfo.phone}` : ''}
    </div>
  </div>
  
  <div class="ats-badge">
    <span class="score">ATS Score: ${analysis.score || 75}/100</span>
  </div>
  
  ${sections.summary ? `
  <div class="section">
    <div class="section-title">Perfil</div>
    <p>${sections.summary}</p>
  </div>
  ` : ''}
  
  ${sections.experience ? `
  <div class="section">
    <div class="section-title">Experiencia Profesional</div>
    ${sections.experience.map((exp: any) => `
    <div class="experience-item">
      <h3>${exp.title || 'Desarrollador'}</h3>
      <div class="meta">${exp.company || 'Empresa'} ${exp.duration ? `| ${exp.duration}` : ''}</div>
      ${exp.achievements ? `<ul>${exp.achievements.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${structuredCV.skills && structuredCV.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Habilidades</div>
    <div class="skills-list">
      ${structuredCV.skills.map((s: string) => `<span class="skill-item">${s}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${structuredCV.education && structuredCV.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Educación</div>
    ${structuredCV.education.map((edu: any) => `
    <div class="experience-item">
      <h3>${edu.degree || 'Título'}</h3>
      <div class="meta">${edu.institution || 'Institución'} ${edu.year ? `| ${edu.year}` : ''}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>`;
}

/**
 * Minimal single-column CV template with clean, distraction-free design.
 */
function minimalTemplate(cv: CVImprovementResult): string {
  const { improvedText, structuredCV, analysis } = cv;
  const sections = parseCVSections(improvedText);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CV - ${structuredCV.personalInfo.name || 'Candidato'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg: #ffffff;
      --text: #1a1a1a;
      --text-light: #6b7280;
      --accent: #374151;
      --border: #e5e7eb;
      --code-bg: #f3f4f6;
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f0f0f;
        --text: #f5f5f5;
        --text-light: #9ca3af;
        --accent: #d1d5db;
        --border: #2d2d2d;
        --code-bg: #1f1f1f;
      }
    }
    
    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: var(--text);
      line-height: 1.6;
      max-width: 210mm;
      margin: 0 auto;
      padding: 48px 56px;
      background: var(--bg);
    }
    
    /* Header */
    header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    
    header h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    
    header .title {
      font-size: 14px;
      color: var(--text-light);
      margin-bottom: 12px;
    }
    
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: var(--text-light);
    }
    
    .contact-info span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Sections */
    .section {
      margin-bottom: 28px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-light);
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    
    /* Experience */
    .experience-item {
      margin-bottom: 20px;
    }
    
    .experience-item h3 {
      font-size: 14px;
      font-weight: 500;
    }
    
    .experience-item .company {
      font-size: 12px;
      color: var(--text-light);
      margin-bottom: 6px;
    }
    
    .experience-item ul {
      margin-left: 16px;
      font-size: 12px;
    }
    
    .experience-item li {
      margin-bottom: 4px;
    }
    
    /* Skills */
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-item {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: var(--code-bg);
      padding: 4px 10px;
      border-radius: 4px;
    }
    
    /* Education */
    .education-item {
      margin-bottom: 12px;
    }
    
    .education-item h4 {
      font-size: 13px;
      font-weight: 500;
    }
    
    .education-item p {
      font-size: 12px;
      color: var(--text-light);
    }
    
    /* Summary */
    .summary {
      font-size: 13px;
      line-height: 1.7;
    }
    
    /* ATS Badge */
    .ats-badge {
      display: inline-block;
      font-size: 10px;
      padding: 4px 8px;
      background: var(--code-bg);
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .ats-badge .score {
      font-weight: 500;
      color: var(--text);
    }
  </style>
</head>
<body>
  <header>
    <h1>${structuredCV.personalInfo.name || 'Nombre del Candidato'}</h1>
    <div class="title">${sections.title || 'Profesional'}</div>
    <div class="contact-info">
      ${structuredCV.personalInfo.email ? `<span>${structuredCV.personalInfo.email}</span>` : ''}
      ${structuredCV.personalInfo.phone ? `<span>${structuredCV.personalInfo.phone}</span>` : ''}
      ${structuredCV.personalInfo.location ? `<span>${structuredCV.personalInfo.location}</span>` : ''}
    </div>
  </header>
  
  ${sections.summary ? `
  <div class="section">
    <div class="summary">${sections.summary}</div>
  </div>
  ` : ''}
  
  ${sections.experience ? `
  <div class="section">
    <div class="section-title">Experiencia</div>
    ${sections.experience.map((exp: any) => `
    <div class="experience-item">
      <h3>${exp.title || 'Posición'}</h3>
      <div class="company">${exp.company || 'Empresa'} ${exp.duration ? ` · ${exp.duration}` : ''}</div>
      ${exp.achievements ? `<ul>${exp.achievements.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${structuredCV.skills && structuredCV.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Stack</div>
    <div class="skills-grid">
      ${structuredCV.skills.map((s: string) => `<span class="skill-item">${s}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${structuredCV.education && structuredCV.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Formación</div>
    ${structuredCV.education.map((edu: any) => `
    <div class="education-item">
      <h4>${edu.degree || 'Título'}</h4>
      <p>${edu.institution || 'Institución'} ${edu.year ? ` · ${edu.year}` : ''}</p>
    </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${analysis?.score ? `
  <div class="ats-badge">
    <span class="score">ATS Score: ${analysis.score}/100</span>
  </div>
  ` : ''}
</body>
</html>`;
}

/**
 * Parse CV text into structured sections.
 */
function parseCVSections(text: string): Record<string, any> {
  const lines = text.split('\n').filter(line => line.trim());
  const sections: Record<string, any> = {};
  let currentSection = 'intro';
  let currentItem: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect section headers
    if (/^(experience|experiencia|work history|historial laboral)/i.test(trimmed)) {
      currentSection = 'experience';
      sections.experience = [];
      continue;
    }
    if (/^(education|educacion|education)/i.test(trimmed)) {
      currentSection = 'education';
      continue;
    }
    if (/^(skills|habilidades|technical skills)/i.test(trimmed)) {
      currentSection = 'skills';
      continue;
    }
    if (/^(summary|perfil|about me|acerca de)/i.test(trimmed)) {
      currentSection = 'summary';
      continue;
    }
    if (/^(projects|proyectos)/i.test(trimmed)) {
      currentSection = 'projects';
      sections.projects = [];
      continue;
    }
    if (/^(certifications|certificaciones)/i.test(trimmed)) {
      currentSection = 'certifications';
      sections.certifications = [];
      continue;
    }
    if (/^(languages|idiomas)/i.test(trimmed)) {
      currentSection = 'languages';
      sections.languages = [];
      continue;
    }

    // Parse content based on current section
    switch (currentSection) {
      case 'intro':
        if (!sections.title && trimmed.length < 50) {
          sections.title = trimmed;
        } else if (!sections.summary) {
          sections.summary = trimmed;
        }
        break;
      case 'experience':
        if (/^[A-Z]/.test(trimmed) && trimmed.length < 60) {
          currentItem = { title: trimmed.replace(/[*#]/g, ''), company: '', duration: '', achievements: [] };
          sections.experience.push(currentItem);
        } else if (currentItem && trimmed.startsWith('-') || trimmed.startsWith('•')) {
          currentItem.achievements.push(trimmed.replace(/^[-•]\s*/, ''));
        } else if (currentItem && trimmed.includes('|')) {
          const parts = trimmed.split('|');
          currentItem.company = parts[0].trim();
          currentItem.duration = parts[1]?.trim() || '';
        } else if (currentItem && !currentItem.company) {
          currentItem.company = trimmed;
        }
        break;
      case 'summary':
        sections.summary = (sections.summary || '') + ' ' + trimmed;
        break;
      default:
        break;
    }
  }

  return sections;
}

/**
 * Get color based on ATS score.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#27ae60';
  if (score >= 60) return '#f39c12';
  return '#e74c3c';
}

/**
 * Render CV to HTML using the specified template.
 */
export function renderCVToHTML(cv: CVImprovementResult, options: CVTemplateOptions = {}): string {
  const { template = 'modern', accentColor = '#2563eb' } = options;

  let html: string;
  switch (template) {
    case 'classic':
      html = classicTemplate(cv);
      break;
    case 'minimal':
      html = minimalTemplate(cv);
      break;
    case 'modern':
    default:
      html = modernTemplate(cv, accentColor);
  }

  // Sanitize output to prevent XSS from AI-generated content
  return sanitizeHtml(html);
}
