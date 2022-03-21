import knex from 'knex';

export const knexSql = knex({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'root',
      password : 'Admin-123',
      database : 'mysql'
    }
  });
export const knexSqlite = knex({
  client: 'sqlite',
  connection: {
    filename: './db/ecommerce.sqlite'
  },
  useNullAsDefault: true,
})
;
