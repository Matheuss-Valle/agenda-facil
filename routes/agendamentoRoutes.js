const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

router.use(agendamentoController.verificarAutenticacao);

router.get('/', agendamentoController.listarAgendamentos);
router.post('/', agendamentoController.criarAgendamento);
router.get('/editar/:id', agendamentoController.editarAgendamentoForm);
router.post('/editar/:id', agendamentoController.editarAgendamento);
router.post('/deletar/:id', agendamentoController.deletarAgendamento);

router.get('/api/agendamentos', agendamentoController.apiListarAgendamentos);
router.post('/api/agendamentos', agendamentoController.apiCriarAgendamento);
router.put('/api/agendamentos/:id', agendamentoController.apiEditarAgendamento);
router.delete('/api/agendamentos/:id', agendamentoController.apiDeletarAgendamento);

module.exports = router;