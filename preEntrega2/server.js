import express from 'express'
import {engine} from 'express-handlebars'
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { check_products_table, insert, select, select_by_id } from './db/dbActions.js';
import { knexSql, knexSqlite } from './db/dbConfig.js';
import Products from './models/Products.js';
import Messages from './models/Messages.js';
const uri = "mongodb+srv://ezequielcoder:admin123@coderdb.mw5hj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer)

const PORT = 8080

const {Router} = express
const productsResources = Router()


const server = httpServer.listen(PORT,()=>{
    console.log(`Servidor con webSockets escuchando en el puerto ${server.address().port}`)
})

server.on("error", error =>console.log(`Error en servidor: ${error}`))

mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );

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
app.get('/productos',async(req,res)=>{
    let empty
    const response = await Products.find({});

    try {
        response == [] ? empty = true : empty = false
        console.log(response)
        res.render("index",{
            products:response,
            empty: empty
        })
    } catch (error) {
        res.status(500).send(error);
    }
    
})

productsResources.post('/',async(req,res)=>{
    const product = new Products(req.body);
    try {
        await product.save();
        res.redirect("/productos");
    } catch (error) {
        res.status(500).send(error);
    }
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
    const products = await Products.find({});
    try {
        socket.emit("products", products)
    } catch (error) {
        res.status(500).send(error);
    }
    const messages = await Messages.find({})
    try {
        socket.emit("chat", messages)
    } catch (error) {
        res.status(500).send(error);
    }
  
    socket.on("sendMessage", data =>{
        const messages = new Messages(req.body);
        try {
            await messages.save();
            io.sockets.emit("newMessage",data)
        } catch (error) {
            res.status(500).send(error);
        }
    
    })
    socket.on("receivedMessage", data =>{
        
    })
})

