import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendVerificationEmail(to: string, link: string) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "rafaelbrandao1992@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken?.token as string,
      },
    } as any);

    const mailOptions = {
      from: "5K Energia Solar <rafaelbrandao1992@gmail.com>",
      to,
      subject: "Crie sua senha - 5K Energia Solar",
      html: `
        <h2>Bem-vindo!</h2>
        <p>Clique no botão abaixo para criar sua senha:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Criar senha</a>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    throw err;
  }
}
