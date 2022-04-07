import express from 'express'
import {engine} from 'express-handlebars'
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Products from './models/Products.js';
import Messages from './models/Messages.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

//mongo
const uri = "mongodb+srv://ezequielcoder:admin123@coderdb.mw5hj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer)

const PORT = 8080

const {Router} = express
const productsResources = Router()

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: uri,
        mongoOptions: advancedOptions
    }),
    cookie: {maxAge: 600000},
    secret: "shhhh",
    resave: false,
    saveUninitialized: false,
}))


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

app.use(express.json())
productsResources.use(express.json())
app.use(express.urlencoded({extended : true}))
productsResources.use(express.urlencoded({extended : true}))

app.use('/api/products',productsResources)
app.use(express.static('./public'))

const auth = (req, res, next) => {
    if (req.session?.user) {
        return next()
    }
    // res.status(401).send("Authentication error!");
    return res.redirect("/login");
}

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/logout', (req, res) => {
    const data = req.query?.user
    res.render("goodbye", { user: data })
})

app.get('/', auth, (req,res)=>{
    res.render("main",{
        url: "/api/products",
        method: "post",
        button: "Create product",
        user: req.session?.user
    })
})
app.get('/productos', auth, async(req,res)=>{
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

productsResources.post('/',async(req, res)=>{
    const product = new Products(req.body);
    try {
        await product.save();
        res.redirect("/productos");
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post('/api/login', (req, res) => {
    const response = req.body;
    if (!response.name) {
        return res.send("Login failed");
    }
    req.session.user = response.name;
    res.redirect("/");
})

app.post('/api/logout', (req, res) => {
    const user = req.session.user;

    req.session.destroy(err =>{
        if(err) {
            return res.json({ status: "Logout error", body: err })
        }
        res.redirect("/logout/?user=" + user);
    })
})

//Websockets

io.on("connection", async(socket)=>{
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
  
    socket.on("sendMessage", async(data) =>{
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

