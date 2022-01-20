import express from 'express'
import Products from './controllers/productsController.js'
import Cart from './controllers/cartController.js'

const app = express()
const PORT = 8080

const {Router} = express
const productsApi = Router()
const cartApi = Router()

const products = new Products()
const cart = new Cart()

const server = app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})

server.on("error", error =>console.log(`Error en servidor: ${error}`))

const auth = true

productsApi.use(express.json())
productsApi.use(express.urlencoded({extended : true}))

cartApi.use(express.json())
cartApi.use(express.urlencoded({extended : true}))

app.use('/api/products',productsApi)
app.use('/api/cart',cartApi)

productsApi.get('/:product_id?',(req,res)=>{
    const product_id = req.params.product_id
 
    if(product_id){
        products.show(product_id)
        .then(response =>{
            res.json(response)
        })
    }else{
        products.index()
        .then(response=>{
            res.json(response)
        })
    }
})
productsApi.post('/',(req,res)=>{
    if (auth){
        const object = set_products_params(
            req.body.name,
            req.body.description,
            req.body.code,
            req.body.imageURL,
            req.body.price,
            req.body.stock
        )
    
        products.create(object)
        .then(response=>{
            res.json(response)
        })
    }else{
        res.json({error:-1, description: `path ${req.originalUrl} and method ${req.method} not autorized`})
    }
    
})
productsApi.put('/:product_id',(res,req)=>{
    if (auth){
        const product_id = res.params.product_id
        const object = set_products_params(
            req.body.name,
            req.body.description,
            req.body.code,
            req.body.imageURL,
            req.body.price,
            req.body.stock
        )
        products.update(product_id,object)
        .then(response=>{
            res.json(response)
        })
        }else{
            res.json({error:-1, description: `path ${req.originalUrl} and method ${req.method} not autorized`})
        }
    
})
productsApi.delete('/:product_id',(res,req)=>{
    if(auth){
        const product_id =res.params.product_id
        products.destroy(product_id)
        .then(response=>{
            res.json({response})
    })
    }else{
        res.json({error:-1, description: `path ${req.originalUrl} and method ${req.method} not autorized`})
    }
    
}
)

cartApi.get('/:cart_id/products',(res,req)=>{
    const cart_id = req.params.cart_id
    cart.show(cart_id)
    .then(response=>{
        res.json(response)
    })
})
cartApi.post('/',(res,req)=>{
    cart.create()
    .then(response=>{
        res.json(response)
    })
})
cartApi.delete('/:cart_id',(res,req)=>{
    const cart_id = req.params.cart_id
    cart.destroy(cart_id)
    .then(response=>{
        res.json(response)
    })
})
cartApi.post('/:cart_id/products',(res,req)=>{
    const cart_id = req.params.cart_id
    const product = req.body
    const object ={
        name: product.name,
        description: product.description,
        code: product.code,
        imageURL: product.imageURL,
        price: product.price,
        quantity: product.quantity
    }
    cart.addToCart(cart_id, object)
    .then(response=>{
        res.json(response)
    })
})
cartApi.delete('/:cart_id/productos/:product_id',(res,req)=>{
    const cart_id = req.params.cart_id
    const product_id = req.params.product_id

    cart.removeProduct(cart_id, product_id)
    .then(response=>{
        res.json({response})
    })
})

app.all((res,req)=>{
    res.json({error:-2,description: `path ${req.originalUrl} and method ${req.method} not implemented yet`})
})

const set_products_params= (name,description,code,imageURL,price,stock)=> {
    return {name,description,code,imageURL,price,stock}
}