const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
const PORT = 3000;



// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/agendamentoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB...'))
.catch(err => console.error('Erro de conexão:', err));

// Middlewares
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

// Rota da página inicial
app.get('/', (req, res) => {
  res.render('index');
});

// Rotas
app.use('/', authRoutes);
app.use('/agendamentos', agendamentoRoutes);


// Início do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});









