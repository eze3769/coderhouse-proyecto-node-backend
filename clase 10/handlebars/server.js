import express from 'express'
import {engine} from 'express-handlebars'
import Products from "./controllers/products.js"



const app = express()
const PORT = 8080

const {Router} = express
const productsResources = Router()

const products = new Products()


const server = app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
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
        button: "Crear un producto"
    })
})
app.get('/productos',(req,res)=>{
    products.index()
    .then(response=>{
        let empty
        response === [] ? empty = true : empty = false
        
        res.render("index",{
            products:response,
            empty: empty
        })
    })
    
})
productsResources.post('/',(req,res)=>{
    let data = req.body

    products.create(data)
    .then(response => {
        // res.send(response)
        res.redirect("/productos")
    })
    
})

app.use(express.json())
productsResources.use(express.json())
app.use(express.urlencoded({extended : true}))
productsResources.use(express.urlencoded({extended : true}))

app.use('/api/products',productsResources)
app.use(express.static('public'))