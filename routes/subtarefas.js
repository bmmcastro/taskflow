const express = require('express');
const router = express.Router();
const { listarSubtarefas, criarSubtarefa, atualizarSubtarefa, apagarSubtarefa } = require('../controllers/subtarefasController');

// rotas das subtarefas (Alexandre) — localhost/subtarefas
router.get('/', listarSubtarefas);
router.post('/', criarSubtarefa);
router.patch('/:id', atualizarSubtarefa);
router.delete('/:id', apagarSubtarefa);

module.exports = router;
