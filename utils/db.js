//ligacao a base de dados (Bruno)
const { Pool } = require('pg');

//dados de acesso - cada um poe aqui os dados do seu PostgreSQL
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'taskflow',
    user: 'postgres',
    password: 'a-tua-password'
})

//testamos logo a ligacao no arranque
pool.connect()
    .then(() => console.log('Base de dados ligada com sucesso'))
    .catch((msg) => console.error('Ocorreu um erro a ligar a base de dados', msg))

module.exports = {
    pool
}
