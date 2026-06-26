const express = require('express');
const router = express.Router();
const { verConvite, aceitarConvite } = require('../controllers/convitesController');

// rotas dos convites (Nelson) - localhost/convites
router.get('/:token', verConvite);
router.post('/:token/aceitar', aceitarConvite);

module.exports = router;
