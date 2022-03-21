import express from 'express'
import {engine} from 'express-handlebars'
import { createServer } from "http";
import { Server } from "socket.io";
import { check_products_table, insert, select, select_by_id } from './db/dbActions.js';
import { knexSql, knexSqlite } from './db/dbConfig.js';
import { faker } from '@faker-js/faker';
import { denormalizeMessages, normalizeMessages, print } from './utils/normalizer.js';

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer)

const messages = []

const PORT = 8080

const {Router} = express
const productsResources = Router()

const server = httpServer.listen(PORT,()=>{
    console.log(`Servidor con webSockets escuchando en el puerto ${server.address().port}`)
})

server.on("error", error =>console.log(`Error en servidor: ${error}`))

app.engine("hbs",
engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: "./views/layouts",
    partialsDir:  "./views/partials"
    })
)

app.set("view engine", "hbs")
app.set("views", "./views")

app.use(express.static("public"))

app.get('/',(req,res)=>{
    res.render("main",{
        url: "/api/products",
        method: "post",
        button: "Create product"
    })
})

app.get('/productos',(req,res)=>{
    let empty
    select(knexSql, 'products', '*')
    .then(response=>{
        response == [] ? empty = true : empty = false

        res.render("index",{
            products:response,
            empty: empty
        })
    })
    .catch(err => console.error("error:", err))
    
    
})

app.get('/api/products-test', (req, res) => {
    const fakeProducts = [];
    for(let i=0; i < 5; i++){
        fakeProducts.push(
            {
                id: i+1,
                title: faker.commerce.productName(),
                price: faker.datatype.number({ min: 10, max: 1000, precision: 0.01 }) ,
                thumbnail: faker.commerce.price(),
            }
        )
    }
    res.render("index",{
        products: fakeProducts,
        empty: false,
    })
    
})

productsResources.post('/',(req,res)=>{
    let data = req.body
    check_products_table(knexSql)
    insert(knexSql, "products", data)
    .then(response => {
        res.redirect("/productos")
       // io.sockets.emit("addedProduct",data)
    })
    .catch(err=>{
        console.log(err)
        throw err
    })
})

app.use(express.json())
productsResources.use(express.json())
app.use(express.urlencoded({extended : true}))
productsResources.use(express.urlencoded({extended : true}))

app.use('/api/products',productsResources)
app.use(express.static('./public'))

//Websockets

io.on("connection", (socket)=>{
    console.log("user connected. ID:",socket.id)
    socket.emit("message", "connected to websocket")
    select(knexSql, "products", "*")
    .then(response =>{
        socket.emit("products", response)
    })
    socket.emit("chat", messages.length > 0 ? normalizeMessages(messages) : [])
    

    socket.on("sendMessage", data =>{
        console.log(messages)
        messages.push(denormalizeMessages(data))

        io.sockets.emit("newMessage", data)
    })
    
    socket.on("receivedMessage", data =>{
        
    })
})
