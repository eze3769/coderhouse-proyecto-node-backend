import express from 'express';
import {engine} from 'express-handlebars';
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Products from './models/Products.js';
import Messages from './models/Messages.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Strategy } from 'passport-local';
import passport from 'passport';
import { compareSync } from 'bcrypt';
import * as routes from './routes';

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
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 600000,
      },
    rolling: true,
    secret: "shhhh",
    resave: false,
    saveUninitialized: false,
}))

   app.use(passport.initialize());
   app.use(passport.session());
   

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

const isValidPassword = (user, password) => {
    return compareSync(password, user.password);
}

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    }
    res.redirect('login');
}

passport.use('login', new Strategy((email, password, done) => {
    User.findOne({ email }, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            console.log('Not exists user with email ' + email);
            return done(null, false);
        }

        if (!isValidPassword(user, password)) {
            console.log('Invalid password');
            return done(null, false);
        }

        return done(null, user);
    })
})
)

passport.use('signup', new Strategy({
    passReqToCallback: true
   },
    (req, email, password, done) => {
      User.findOne({ 'email': email }, function (err, user) {
   
        if (err) {
          console.log('Error in SignUp: ' + err);
          return done(err);
        }
   
        if (user) {
          console.log('User already exists');
          return done(null, false)
        }
   
        const newUser = {
          password: createHash(password),
          email: req.body.email,
        }

        User.create(newUser, (err, userWithId) => {
       if (err) {
         console.log('Error in Saving user: ' + err);
         return done(err);
       }
       console.log(user)
       console.log('User Registration succesful');
       return done(null, userWithId);
     });
   });
 })
)

function createHash(password) {
  return bCrypt.hashSync(
            password,
            bCrypt.genSaltSync(10),
            null);
}

   

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


app.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}), routes.postLogin)

app.post('/register', passport.authenticate('register', {failureRedirect: '/failregister'}), routes.postRegister)

app.get('/logout', routes.getLogout);

app.get('/register',(req,res)=>{
    res.render("register")
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

