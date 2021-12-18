const express = require("express")
const app = express()
const path = require("path")
const contenedor = require("./controllers/contenedor");
const file =  new contenedor.Contenedor("./controllers/productos.txt")


const PORT = 3000

const server = app.listen(PORT, ()=>{
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
})

app.get('/productos', (req,res) =>{
    file.getAll().then(data=>{
        res.send(data)
    })
    
})

app.get('/productoRandom', (req,res) =>{
    file.getAll().then(data=>{
        const length = data.length
        const random = Math.floor(Math.random() * length)
        res.send((data[random]))
    })
})