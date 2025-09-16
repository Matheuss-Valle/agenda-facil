const bcrypt = require('bcrypt');
const User = require('../models/user');
//const User = require('../models/index');

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.send('Preencha todos os campos! <a href="/login">Tentar novamente</a>');
    }
    const usuario = await User.findOne({ username });
    if (!usuario || !usuario.password) {
        return res.send('Usuário ou senha incorretos! <a href="/login">Tentar novamente</a>');
    }
    const senhaCorreta = await bcrypt.compare(password, usuario.password);
    if (senhaCorreta) {
        req.session.username = username;
        res.redirect('/agendamentos');
    } else {
        res.send('Usuário ou senha incorretos! <a href="/login">Tentar novamente</a>');
    }
};

exports.getCadastro = (req, res) => {
    res.render('cadastro');
};
exports.postCadastro = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.send('Preencha todos os campos! <a href="/cadastro">Tentar novamente</a>');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const novoUsuario = new User({ username, password: hashedPassword });

    try {
        await novoUsuario.save();
        req.session.username = username;
        res.redirect('/agendamentos');
    } catch (err) {
        res.status(500).send('Erro ao cadastrar usuário. <a href="/cadastro">Tente novamente</a>');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};