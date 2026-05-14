const express = require('express');
const router = express.Router();
const { listarProjetos, criarProjeto, listarMembros, juntarMembro, removerMembro, apagarProjeto } = require('../controllers/projetosController');

// rotas dos projetos e membros (Nelson) - localhost/projetos
router.get('/', listarProjetos);
router.post('/', criarProjeto);
router.get('/:id/membros', listarMembros);
router.post('/:id/membros', juntarMembro);
router.delete('/:id/membros/:utilizadorId', removerMembro);
router.delete('/:id', apagarProjeto);

module.exports = router;
