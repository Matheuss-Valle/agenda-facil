const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('Tipo de getLogin:', typeof authController.getLogin);
console.log('authController:', authController);

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/cadastro', authController.getCadastro);
router.post('/cadastro', authController.postCadastro);
router.get('/logout', authController.logout);

module.exports = router;
