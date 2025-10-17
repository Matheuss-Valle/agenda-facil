const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Rotas
const authRoutes = require('./routes/authRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const Agendamento = require('./models/agendamento'); // 🔥 IMPORTANTE

const app = express();
const PORT = process.env.PORT || 3000;

// ======== Conexão MongoDB ========
mongoose.connect('mongodb://localhost:27017/agendamentoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro de conexão MongoDB:', err));

// ======== Configurações Express ========
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'sua_chave_secreta',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Página inicial
app.get('/', (req, res) => {
  res.render('index');
});

// Rotas
app.use('/', authRoutes);
app.use('/agendamentos', agendamentoRoutes);

// ======== INICIALIZAÇÃO DO SERVIDOR ========
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

// =====================================================
// 🔹 INTEGRAÇÃO WHATSAPP
// =====================================================
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let whatsappPronto = false;

// Exibe QR code
client.on('qr', (qr) => {
  console.clear();
  console.log('📱 Escaneie o QR Code abaixo para conectar no WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Quando o WhatsApp conecta
client.on('ready', () => {
  whatsappPronto = true;
  console.log('✅ WhatsApp conectado e pronto!');
  iniciarCron(); // só inicia o cron depois que estiver pronto
});

// Quando desconecta
client.on('disconnected', (reason) => {
  whatsappPronto = false;
  console.log('⚠️ WhatsApp desconectado:', reason);
});

// Falha de autenticação
client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação:', msg);
});

// Inicializa o WhatsApp
(async () => {
  try {
    console.log('📞 Iniciando cliente WhatsApp...');
    await client.initialize();
  } catch (error) {
    console.error('❌ Erro ao inicializar o WhatsApp:', error);
  }
})();

// =====================================================
// 🔹 FUNÇÕES AUXILIARES
// =====================================================
function formatarNumero(numero) {
  return numero.replace(/\D/g, '');
}

// Envia lembretes de agendamentos de amanhã
async function enviarLembretes() {
  try {
    const hoje = new Date();
    const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    const dataFormatada = amanha.toISOString().split('T')[0];

    const pacientes = await Agendamento.find({
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$data" } },
          dataFormatada
        ]
      }
    });

    if (!pacientes.length) {
      console.log('ℹ️ Nenhum lembrete para enviar hoje.');
      return;
    }

    console.log(`📆 Encontrados ${pacientes.length} lembretes para enviar.`);

    for (const paciente of pacientes) {
      const numero = formatarNumero(paciente.telefone) + '@c.us';
      const mensagem = `Olá ${paciente.paciente}, lembrando que sua consulta é amanhã às ${paciente.hora}.`;

      try {
        await client.sendMessage(numero, mensagem);
        console.log(`📩 Mensagem enviada para ${paciente.paciente} (${numero})`);
      } catch (err) {
        console.log(`❌ Erro ao enviar para ${paciente.paciente}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao enviar lembretes:', error);
  }
}

// =====================================================
// 🔹 CRON JOB - roda todos os dias às 08:00
// =====================================================
function iniciarCron() {
  console.log('⏰ Agendando cron de lembretes diários (08:00)...');

  cron.schedule('0 8 * * *', async () => {
    if (!whatsappPronto) {
      console.log('⚠️ WhatsApp não está pronto, pulando envio...');
      return;
    }
    console.log('🚀 Executando envio de lembretes...');
    await enviarLembretes();
  }, {
    timezone: 'America/Sao_Paulo'
  });
}
