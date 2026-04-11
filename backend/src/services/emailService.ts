import { Resend } from 'resend';
import { config } from '../config/index.js';

// Initialize Resend client
const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

/**
 * Email templates and sending service
 */
export const emailService = {
  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    to: string,
    userName: string,
    token: string
  ): Promise<{ success: boolean; error?: string }> {
    const verifyUrl = `${config.frontend.url}/auth/verify-email?token=${token}`;
    
    const html = getVerificationEmailTemplate(userName, verifyUrl);

    return sendEmail({
      to,
      subject: 'Verificá tu email - CVMaster',
      html,
    });
  },

  /**
   * Send password reset link
   */
  async sendPasswordResetEmail(
    to: string,
    userName: string,
    token: string
  ): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${config.frontend.url}/auth/reset-password?token=${token}`;
    
    const html = getPasswordResetEmailTemplate(userName, resetUrl);

    return sendEmail({
      to,
      subject: 'Resetear tu contraseña - CVMaster',
      html,
    });
  },

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const dashboardUrl = `${config.frontend.url}/dashboard`;
    
    const html = getWelcomeEmailTemplate(userName, dashboardUrl);

    return sendEmail({
      to,
      subject: '¡Bienvenido a CVMaster! 🚀',
      html,
    });
  },

  /**
   * Send CV analysis complete notification
   */
  async sendCVAnalysisComplete(
    to: string,
    userName: string,
    cvTitle: string,
    score: number
  ): Promise<{ success: boolean; error?: string }> {
    const dashboardUrl = `${config.frontend.url}/dashboard`;
    
    const html = getCVAnalysisCompleteTemplate(userName, cvTitle, score, dashboardUrl);

    return sendEmail({
      to,
      subject: `¡Tu CV "${cvTitle}" está listo! - CVMaster`,
      html,
    });
  },

  /**
   * Send password changed notification
   */
  async sendPasswordChangedNotification(
    to: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = getPasswordChangedTemplate(userName);

    return sendEmail({
      to,
      subject: 'Tu contraseña fue actualizada - CVMaster',
      html,
    });
  },
};

// ============================================================
// Internal helper to send email via Resend
// ============================================================
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email not sent.');
    console.log(`📧 Email would be sent to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    // Log first 200 chars of HTML for debugging
    console.log(`📧 HTML preview: ${html.substring(0, 200)}...`);
    return { success: true }; // Don't fail the flow in dev mode
  }

  try {
    const result = await resend.emails.send({
      from: config.resend.fromEmail,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`✅ Email sent to ${to} (${subject})`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================
// Email Templates
// ============================================================

function getBaseStyles(): string {
  return `
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #1a1a1a;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 24px;
    }
    .button {
      display: inline-block;
      background-color: #1a1a1a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
    }
    .button:hover {
      background-color: #333333;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #1a1a1a;
      text-decoration: underline;
    }
    .link-fallback {
      word-break: break-all;
      font-size: 12px;
      color: #666666;
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
    }
    .score-badge {
      display: inline-block;
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 700;
      margin: 16px 0;
    }
  `;
}

function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CVMaster</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 CVMaster. Todos los derechos reservados.</p>
      <p>¿No solicitaste este email? Podés <a href="{{FRONTEND_URL}}/dashboard/settings">ignoralo</a> o <a href="mailto:support@cvmaster.com">contactanos</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getVerificationEmailTemplate(userName: string, verifyUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">Verificá tu email</h2>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Hola <strong>${escapeHtml(userName)}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Gracias por registrarte en CVMaster. Para activar tu cuenta, hacé click en el botón de abajo:
    </p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verificar mi email</a>
    </div>
    <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999;">
      ⏰ Este enlace expira en 24 horas.
    </p>
    <div class="link-fallback">
      Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  `;
  return getEmailTemplate(content);
}

function getPasswordResetEmailTemplate(userName: string, resetUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">Resetear tu contraseña</h2>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Hola <strong>${escapeHtml(userName)}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Recibimos una solicitud para resetear tu contraseña de CVMaster. Hacé click en el botón de abajo para crear una nueva:
    </p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Resetear contraseña</a>
    </div>
    <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999;">
      ⏰ Este enlace expira en 1 hora.
    </p>
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 24px 0 0 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⚠️ <strong>Importante:</strong> Si no solicitaste este cambio, podés ignorar este email de forma segura. Tu contraseña permanecerá sin cambios.
      </p>
    </div>
    <div class="link-fallback">
      Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
  `;
  return getEmailTemplate(content);
}

function getWelcomeEmailTemplate(userName: string, dashboardUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">¡Bienvenido a CVMaster! 🚀</h2>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Hola <strong>${escapeHtml(userName)}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Tu cuenta fue creada exitosamente. Ahora podés empezar a optimizar tu CV con inteligencia artificial para superar los sistemas ATS.
    </p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 16px;">¿Cómo empezar?</h3>
      <ol style="margin: 0; padding-left: 20px; color: #0c4a6e; line-height: 1.8;">
        <li>Subí tu CV actual en formato PDF</li>
        <li>Contanos a qué puesto querés aplicar</li>
        <li>Nuestra IA analizará y optimizará tu CV</li>
        <li>Descargá la versión mejorada y postuláte</li>
      </ol>
    </div>

    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="button">Ir al Dashboard</a>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 14px; color: #999999; line-height: 1.6;">
      ¿Tenés dudas? Revisá nuestra <a href="https://cvmaster.com/faq" style="color: #1a1a1a;">sección de preguntas frecuentes</a> o contactanos a <a href="mailto:support@cvmaster.com" style="color: #1a1a1a;">support@cvmaster.com</a>.
    </p>
  `;
  return getEmailTemplate(content);
}

function getCVAnalysisCompleteTemplate(userName: string, cvTitle: string, score: number, dashboardUrl: string): string {
  const scoreEmoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '📈';
  const scoreMessage = score >= 80 
    ? '¡Excelente puntuación! Tu CV está muy bien optimizado.'
    : score >= 60
    ? 'Buen trabajo. Revisá las sugerencias para mejorarlo aún más.'
    : 'Tu CV tiene margen de mejora. Revisá las sugerencias de la IA.';

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">${scoreEmoji} ¡Tu CV está listo!</h2>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Hola <strong>${escapeHtml(userName)}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      La IA terminó de analizar y optimizar tu CV <strong>"${escapeHtml(cvTitle)}"</strong>.
    </p>

    <div style="text-align: center;">
      <div class="score-badge">${score}/100</div>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666;">${scoreMessage}</p>
    </div>

    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="button">Ver mi CV optimizado</a>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0 0 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.6;">
        💡 <strong>Tip:</strong> Revisá las sugerencias de la IA y descargá tu CV optimizado en PDF para empezar a postularte.
      </p>
    </div>
  `;
  return getEmailTemplate(content);
}

function getPasswordChangedTemplate(userName: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">🔒 Tu contraseña fue actualizada</h2>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Hola <strong>${escapeHtml(userName)}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #666666; line-height: 1.6;">
      Te confirmamos que tu contraseña de CVMaster fue cambiada exitosamente.
    </p>

    <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0 0 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        ⚠️ <strong>¿No fuiste vos?</strong> Si no realizaste este cambio, contactanos inmediatamente a <a href="mailto:support@cvmaster.com" style="color: #991b1b;">support@cvmaster.com</a> y asegurá tu cuenta.
      </p>
    </div>
  `;
  return getEmailTemplate(content);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
