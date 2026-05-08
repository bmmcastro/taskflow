//arranque do servidor (Bruno)

const express = require('express');
const cors = require('cors');
const app = express();

//liga a base de dados (a pool e usada pelos models)
require('./utils/db');

//rotas
const tarefasRoutes = require('./routes/tarefas');
const utilizadoresRoutes = require('./routes/utilizadores');
const projetosRoutes = require('./routes/projetos');
const subtarefasRoutes = require('./routes/subtarefas');

app.use(cors());
app.use(express.json());

//servir o frontend (pasta public)
app.use(express.static(__dirname + '/public'));

//cada grupo de enderecos vai para o seu ficheiro de rotas
app.use('/tarefas', tarefasRoutes);
app.use('/utilizadores', utilizadoresRoutes);
app.use('/projetos', projetosRoutes);
app.use('/subtarefas', subtarefasRoutes);

//no cpanel a porta vem do servidor; no nosso pc e a 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor a funcionar na porta ' + PORT);
})
