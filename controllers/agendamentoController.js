const Agendamento = require('../models/agendamento');

exports.verificarAutenticacao = (req, res, next) => {
  if (req.session.username) {
    return next();
  }

  // Se for chamada da API → retorna JSON em vez de redirecionar
  if (req.originalUrl.startsWith('/agendamentos/api')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  // Se for rota normal (HTML) → redireciona
  res.redirect('/login');
};

exports.listarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ usuario: req.session.username });
    res.render('agendamentos', { agendamentos, username: req.session.username });
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    res.status(500).send('Erro ao carregar agendamentos.');
  }
};

exports.apiListarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ usuario: req.session.username });
    
    // Transformar os dados no formato que o frontend precisa
    const eventos = agendamentos.map(a => ({
      id: a._id,
      title: `${a.paciente} - ${a.hora}`,
      start: a.data.toISOString().slice(0, 10) + 'T' + a.hora
    }));

    res.json(eventos);
  } catch (err) {
    console.error('Erro ao listar agendamentos (API):', err);
    res.status(500).json({ error: 'Erro ao carregar agendamentos.' });
  }
};

exports.criarAgendamento = async (req, res) => {
  const { data, hora, paciente, telefone } = req.body;

  if (!data || !hora || !paciente || !telefone) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    const novoAgendamento = new Agendamento({
      data,
      hora,
      paciente: paciente.trim(),
      telefone: telefone.trim(),
      usuario: req.session.username
    });

    await novoAgendamento.save();
    const salvo = await Agendamento.findById(novoAgendamento._id);
    console.log("No banco realmente ficou:", salvo);
    res.redirect('/agendamentos');
  } catch (err) {
    console.error('Erro ao salvar agendamento:', err);
    res.status(500).send('Erro ao salvar agendamento.');
  }
};

exports.apiCriarAgendamento = async (req, res) => {
  const { data, hora, paciente, telefone } = req.body;

  if (!data || !hora || !paciente || !telefone) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const novoAgendamento = new Agendamento({
      data: new Date(data),
      hora,
      paciente: paciente.trim(),
      telefone: telefone.trim(),
      usuario: req.session.username
    });
    await novoAgendamento.save();

    res.json({
      id: novoAgendamento._id,
      title: `${novoAgendamento.paciente} - ${novoAgendamento.hora}`,
      start: novoAgendamento.data.toISOString().slice(0, 10) + 'T' + novoAgendamento.hora,
      telefone: novoAgendamento.telefone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar agendamento.' });
  }
};

exports.editarAgendamentoForm = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.redirect('/agendamentos');
    }

    res.render('editar', { agendamento });
  } catch (err) {
    console.error('Erro ao carregar agendamento:', err);
    res.redirect('/agendamentos');
  }
};

exports.editarAgendamento = async (req, res) => {
  const { data, hora, paciente, telefone } = req.body;

  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.status(403).send('Acesso negado.');
    }

    agendamento.data = data;
    agendamento.hora = hora;
    agendamento.telefone = telefone.trim();
    agendamento.paciente = paciente.trim();

    await agendamento.save();
    res.redirect('/agendamentos');
  } catch (err) {
    console.error('Erro ao editar agendamento:', err);
    res.status(500).send('Erro ao editar agendamento.');
  }
};

exports.apiEditarAgendamento = async (req, res) => {
  const { data, hora, paciente, telefone } = req.body;
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    agendamento.data = new Date(data);
    agendamento.hora = hora;
    agendamento.telefone = telefone.trim();
    agendamento.paciente = paciente.trim();

    await agendamento.save();

    res.json({
      id: agendamento._id,
      title: `${agendamento.paciente} - ${agendamento.hora}`,
      start: agendamento.data.toISOString().slice(0, 10) + 'T' + agendamento.hora
    });
  } catch (err) {
    console.error('Erro ao editar agendamento (API):', err);
    res.status(500).json({ error: 'Erro ao editar agendamento.' });
  }
};

exports.deletarAgendamento = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.status(403).send('Acesso negado.');
    }

    await agendamento.deleteOne();
    res.redirect('/agendamentos');
  } catch (err) {
    console.error('Erro ao deletar agendamento:', err);
    res.status(500).send('Erro ao deletar agendamento.');
  }
};

exports.apiDeletarAgendamento = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await agendamento.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar agendamento (API):', err);
    res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
};