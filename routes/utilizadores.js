const express = require('express');
const router = express.Router();
const { listarUtilizadores, registar, login, atualizarUtilizador, apagarUtilizador } = require('../controllers/utilizadoresController');

// Rotas dos utilizadores (Diogo). Cada endereco chama a sua funcao no controller.
// localhost/utilizadores
router.get('/', listarUtilizadores);
router.post('/registo', registar);
router.post('/login', login);
router.patch('/:id', atualizarUtilizador);
router.delete('/:id', apagarUtilizador);

module.exports = router;
