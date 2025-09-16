const Agendamento = require('../models/agendamento');

exports.verificarAutenticacao = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
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
/*
exports.criarAgendamento = async (req, res) => {
  const { data, hora, paciente } = req.body;

  if (!data || !hora || !paciente) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    const novoAgendamento = new Agendamento({
      data,
      hora,
      paciente: paciente.trim(),
      usuario: req.session.username
    });

    await novoAgendamento.save();
    res.redirect('/agendamentos');
  } catch (err) {
    console.error('Erro ao salvar agendamento:', err);
    res.status(500).send('Erro ao salvar agendamento.');
  }
};
*/

exports.apiCriarAgendamento = async (req, res) => {
  const { data, hora, paciente } = req.body;
  console.log(req.body); // Veja o que chega do frontend
  if (!data || !hora || !paciente) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const novoAgendamento = new Agendamento({
      data: new Date(data), // Garante que seja Date
      hora,
      paciente: paciente.trim(),
      usuario: req.session.username
    });
    await novoAgendamento.save();
    res.json({
      id: novoAgendamento._id,
      title: `${novoAgendamento.paciente} - ${novoAgendamento.hora}`,
      start: novoAgendamento.data.toISOString().slice(0, 10) + 'T' + novoAgendamento.hora
    });
  } catch (err) {
    console.error(err); // Veja o erro no terminal
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
  const { data, hora, paciente } = req.body;

  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento || agendamento.usuario !== req.session.username) {
      return res.status(403).send('Acesso negado.');
    }

    agendamento.data = data;
    agendamento.hora = hora;
    agendamento.paciente = paciente.trim();

    await agendamento.save();
    res.redirect('/agendamentos');
  } catch (err) {
    console.error('Erro ao editar agendamento:', err);
    res.status(500).send('Erro ao editar agendamento.');
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
// No controller, ao retornar o evento:
res.json({
  id: novoAgendamento._id,
  title: `${novoAgendamento.paciente} - ${novoAgendamento.hora}`,
  start: novoAgendamento.data + 'T' + novoAgendamento.hora
});
