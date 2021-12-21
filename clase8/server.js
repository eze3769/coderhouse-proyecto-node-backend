const express = require("express")
const { rmSync } = require("fs")
const app = express()
const PORT = 8080

const {Router} = express
const productsResources = Router()

const productsController = require("./controllers/products");
const products = new productsController.Products()

const server = app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})

server.on("error", error =>console.log(`Error en servidor: ${error}`))

app.get('/',(req,res)=>{

})

productsResources.get('/',(req,res)=>{
  
    products.index().then((data)=>{
        res.json(data)
})
    
})
productsResources.post('/',(req,res)=>{
   
    products.create(req.body).then((data)=>{
        res.json(data)
    })

})
productsResources.get('/:id',(req,res)=>{
    const id = parseInt(req.params.id)
     products.show(id).then((data)=>{
        res.json(data)
    }) 
})
productsResources.put('/:id',(req,res)=>{
    const id = parseInt(req.params.id)
    const object = req.body
    products.update(id,object)
    res.json({message: `Producto #${id} actualizado correctamente.`})
    
    
})
productsResources.delete('/:id',(req,res)=>{
    const id = parseInt(req.params.id)

    products.destroy(id)

    res.json({message: `Eliminado producto #${id}`})

})

app.use(express.json())
productsResources.use(express.json())
app.use(express.urlencoded({extended : true}))
productsResources.use(express.urlencoded({extended : true}))

app.use('/api/products',productsResources)
app.use(express.static('public'))