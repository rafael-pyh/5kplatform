// Script simples para testar configuração de email
// Execute: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');

console.log('\n📧 Configuração de Email:');
console.log('========================');
console.log(`Host: ${EMAIL_HOST}`);
console.log(`Port: ${EMAIL_PORT}`);
console.log(`User: ${EMAIL_USER}`);
console.log(`Pass: ${EMAIL_PASS ? '****' + EMAIL_PASS.slice(-4) : 'NÃO CONFIGURADO'}`);
console.log(`Pass Length: ${EMAIL_PASS ? EMAIL_PASS.length : 0} caracteres`);
console.log('========================\n');

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ EMAIL_USER ou EMAIL_PASS não está configurado no .env');
  process.exit(1);
}

async function testEmail() {
  console.log('🔄 Testando conexão SMTP...\n');

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    debug: true, // Mostra logs detalhados
    logger: true,
  });

  try {
    // Verifica conexão
    await transporter.verify();
    console.log('\n✅ Conexão SMTP OK!');
    console.log('✅ Credenciais válidas!');
    console.log('\nAgora tente criar um vendedor novamente.');
  } catch (error) {
    console.error('\n❌ ERRO na conexão SMTP:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 SOLUÇÃO:');
      console.error('1. Acesse: https://myaccount.google.com/apppasswords');
      console.error('2. Crie um novo App Password');
      console.error('3. Atualize EMAIL_PASS no .env com a nova senha (sem espaços)');
      console.error('4. Reinicie o Docker: docker-compose down && docker-compose up -d');
    }
  }
}

testEmail();
