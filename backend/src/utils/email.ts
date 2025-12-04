import { Resend } from 'resend';
import { env } from '../config/env';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'noreply@5kplatform.com';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// If RESEND_API_KEY is configured, use Resend SDK
const hasResend = !!RESEND_API_KEY;
let resendClient: Resend | null = null;
if (hasResend) {
  resendClient = new Resend(RESEND_API_KEY as string);
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Modo desenvolvimento: apenas loga se não houver configuração
  if (!hasResend) {
    console.log('\n📧 ========================================');
    console.log('📧 EMAIL (Modo Desenvolvimento - Não Enviado)');
    console.log('📧 ========================================');
    console.log(`📧 Para: ${options.to}`);
    console.log(`📧 Assunto: ${options.subject}`);
    if (options.text) {
      console.log(`📧 Conteúdo:\n${options.text}`);
    }
    console.log('📧 ========================================\n');
    return; // Não tenta enviar email
  }

  try {
    if (!resendClient) throw new Error('Resend client not configured');

    await resendClient.emails.send({
      from: RESEND_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`✅ Email enviado com sucesso para ${options.to} via Resend`);
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌞 5K Energia Solar</h1>
            <p>Bem-vindo à Plataforma de Vendedores</p>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Você foi cadastrado como vendedor na plataforma 5K Energia Solar.</p>
            <p>Para acessar sua conta e visualizar seus leads, você precisa verificar seu email e criar uma senha.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Email e Criar Senha</a>
            </p>
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            <p><strong>Este link expira em 24 horas.</strong></p>
            <p>Se você não solicitou este cadastro, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© 2025 5K Energia Solar. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Olá, ${name}!

Você foi cadastrado como vendedor na plataforma 5K Energia Solar.

Para acessar sua conta, verifique seu email e crie uma senha através do link:
${verificationUrl}

Este link expira em 24 horas.

Se você não solicitou este cadastro, ignore este email.
  `;

  await sendEmail({
    to: email,
    subject: '🌞 Bem-vindo à 5K Energia Solar - Verifique seu Email',
    html,
    text,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Redefinir Senha</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© 2025 5K Energia Solar. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '🔒 Redefinir Senha - 5K Energia Solar',
    html,
    text: `Olá, ${name}!\n\nPara redefinir sua senha, acesse: ${resetUrl}\n\nEste link expira em 1 hora.`,
  });
};
