export const check_products_table = (instance) => {
    instance.schema.hasTable("products")
    .then((exists) => {
        if(!exists){
        return instance.schema.createTable('products', table => {
            table.increments("id")
            table.string("title")
            table.string("thumbnail")
            table.float("price")
        })
        .then(()=>console.log("table created"))
        .catch((err)=>{console.error(err); throw err})
        }
    })
}
export const check_messages_table = (instance) => {
    instance.schema.hasTable("messages")
    .then((exists) => {
        if(!exists){
        return instance.schema.createTable('messages', table => {
            table.increments("id")
            table.string("entities")
            table.string("results")
        })
        .then(()=>console.log("table created"))
        .catch((err)=>{console.error(err); throw err})
        }
    })
}

export const select_by_id = (instance, table, fields, id) => {
    return instance.from(table).select(fields).where("id", id)
}
export const select = (instance, table, fields) => {
    return instance.from(table).select(fields)
}
export const insert = (instance, table, data) => {
    return instance(table).insert(data)
}

