import cookieParser from 'cookie-parser';
import express from 'express';
import {engine} from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Strategy as LocalStrategy} from 'passport-local';
import passport from 'passport';
import bCrypt from 'bcrypt';
import { compareSync } from 'bcrypt';
import * as routes from './authRoutes.js';
import Users from './models/Users.js';
import mongoose from "mongoose";
import { config } from 'dotenv';

config()

const app = express()

const {Router} = express
const productsResources = Router()

//mongo

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/myFirstDatabase?retryWrites=true&w=majority`;
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

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

passport.serializeUser(function(user, done){
    done(null, user.id);
  });
   
passport.deserializeUser(function(id, done){
  Users.findById(id, function(err, user){
    done(err, user);
  });
});

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    console.log("need authenticate first");
    res.redirect('login');
}

passport.use('login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
},(email, password, done) => {
    console.log("entre")
    Users.findOne({ email }, (err, user) => {
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

passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
   },
    (req, email, password, done) => {
        console.log("registro");
        Users.findOne({ 'email': email }, function (err, user) {
   
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

        Users.create(newUser, (err, userWithId) => {
       if (err) {
         console.log('Error in Saving user: ' + err);
         return done(err);
       }
       console.log(user)
       console.log('User Registration successful');
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

app.get('/login',(req,res)=>{
    res.render("login")
})


app.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}), routes.postLogin)

app.post('/register', passport.authenticate('register', {failureRedirect: '/failregister'}), routes.postRegister)

app.get('/register',(req,res)=>{
    res.render("signup")
})

app.get('/logout', (req, res) => {
    const data = req.user.email
    res.render("goodbye", { user: data })
})

app.get('/', checkAuthenticated, (req,res)=>{
    res.render("main",{
        url: "/api/products",
        method: "post",
        button: "Create product",
        user: req.user?.email
    })
})

app.get('/products', checkAuthenticated, async(req,res)=>{
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

app.get('/info',(req, res) => {
    res.render('info', {
        arguments: process.argv.splice(2),
        folder: path.dirname(fileURLToPath(import.meta.url)),
        process: process,
        memory: process.memoryUsage().rss,
        path: process.cwd() 
    })
})

app.get('/random',(req, res) => {
    const quantity = req.query.quantity || 100000000;

    const forked = fork('subprocess/random.js', [quantity]);

    forked.on('message', message => {

        res.render('random', message)
    })

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

export { app };