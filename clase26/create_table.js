import { knexSql, knexSqlite } from "./db/dbConfig.js";

// knexSql.schema.createTable('products', table => {
//             table.increments("id")
//             table.string("title")
//             table.string("thumbnail")
//             table.float("price")
//         })
//         .then(()=>console.log("table created"))
//         .catch((err)=>{console.error(err); throw err})
        
knexSqlite.schema.createTable('messages', table => {
    table.increments("id")
    table.string("email")
    table.timestamp('created_at').defaultTo(knexSqlite.fn.now())
    table.float("message")
})
.then(()=>console.log("table created"))
.catch((err)=>{console.error(err); throw err})
.finally(()=> knexSqlite.destroy())

// knexSqlite.schema.dropTable('products') 

// knexSql.schema.dropTable('messages') 
