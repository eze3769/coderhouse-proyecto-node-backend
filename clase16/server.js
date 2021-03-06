import express from 'express'
import {engine} from 'express-handlebars'
import { createServer } from "http";
import { Server } from "socket.io";
import Products from "./controllers/products.js"
import { check_products_table, insert, select, select_by_id } from './db/dbActions.js';
import { knexSql, knexSqlite } from './db/dbConfig.js';

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer)

const PORT = 8080

const {Router} = express
const productsResources = Router()

const products = new Products()


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
    select(knexSqlite, "messages", "*")
    .then(response => {
        socket.emit("chat", response)
    })

    socket.on("sendMessage", data =>{
        console.log(data)
        insert(knexSqlite, "messages", data)
        .then(response => {
            select_by_id(knexSqlite, "messages", "*", response[0])
            .then((response) => {
                io.sockets.emit("newMessage",response)
                console.log(response)
            })
        })
        .catch(err => console.log(err))
    })
    
    socket.on("receivedMessage", data =>{
        
    })
})
