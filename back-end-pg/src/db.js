import pg from 'pg';

export const Pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "prueba",
    password: "1234",
    port: 5432
})