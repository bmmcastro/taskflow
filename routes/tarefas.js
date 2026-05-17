const express = require('express');
const router = express.Router();
const { listarTarefas, criarTarefa, relatorio, atualizarTarefa, apagarTarefa } = require('../controllers/tarefasController');

//rotas das tarefas (Bruno) - localhost/tarefas
router.get('/', listarTarefas);
router.get('/relatorio', relatorio);
router.post('/', criarTarefa);
router.patch('/:id', atualizarTarefa);
router.delete('/:id', apagarTarefa);

module.exports = router;
