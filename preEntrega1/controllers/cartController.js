import fs from "fs"
const url ='./db/cart.txt'

export default class Cart{
    
    
    async index(){
        
            try{
                let res = await fs.promises.readFile(url, "utf-8")
                res = JSON.parse(res) || null
                return res
            }
            catch(error){
                console.log("No se pudo acceder a los datos.")
            }
            
        
    }
    show(id){
        const product = this.index()
        .then(el=>{
      
            let search = el.find(el=> el.id ==id)
            if(search){
                return search.products
            }else{
                console.log("no se encontró ninguna coincidencia")

                return {error: "Can't find cart with that given ID"}
            }
            
        })
        .catch(error =>{
            console.warning("No se pudo resolver la consulta.")
        })
        return product
    }
    create(){
        let save = this.index()
        let cart = {
            timestamp: Date.now(),
            products: []
        }
            .then(async (res)=>{
                try{
                    let data = res || []
                   
                    if (data == []){
                        cart.id = 1
                        await fs.promises.writeFile(url, JSON.stringify(cart)) 
                      
                    }else{
                        let id = data.length + 1
                        while (data.some(el =>el.id == id)){
                            id++
                        }
                        cart.id = id
                        data = [...data, cart]
                        await fs.promises.writeFile(url, JSON.stringify(cart)) 
                       
                    }
                    
                    return cart.id
                    
                }
                catch(error){
                    console.log("No se pudo guardar.", error)
                    return false
                }
            })
            
           return save
    }
    addToCart(cart_id, product){
        this.index()
        .then(async res=>{
            
            product.datestamp = Date.now()
            let aux = res
            const index = aux.findIndex(el=>el.id == cart_id)
            if (index != -1){
                if (aux[index].products == []){
                    product.id = 1
                    aux.products.push(product)
                    await fs.promises.writeFile(url, JSON.stringify(aux)) 
                    
                }else{
                    let id = aux[index].products.length + 1
                    while (aux[index].products.some(el =>el.id == id)){
                        id++
                    }
                    product.id = id
                    aux.products.push(product)
                    await fs.promises.writeFile(url, JSON.stringify(aux)) 
                   
                }
                return aux
            }else{
                return {error:"Can't find cart with that ID"}
            }
                    
        })
        .catch(error=>{
            console.log("No se pudo agregar el producto al carrito.",error)
        })

    }
    removeProduct(cart_id, product_id){
        this.index()
        .then(async res=>{
            let aux = res
            const index = aux.findIndex(el=>el.id == cart_id)
            const exists = aux[index].products.some(el=>el.id == product_id)
            if (exists){
                let update = aux[index].products.filter(el=>el.id == product_id)

                await fs.promises.writeFile(url, JSON.stringify(update) )
                return true
            }else{
                return {error: "Products with given id doesn't exists"}
            }
            
        
        })
        .catch(error=>{
            console.log("No se pudo agregar el producto al carrito.",error)
        })
    }
    destroy(id){
        
        this.index()
            .then(async el=>{
                const find = el.find(el=>el.id == id)
                console.log(find)
                if (find){
                    console.log("encontro")
                    let aux = el.filter(el=> el.id !=id)
                    await fs.promises.writeFile(url, JSON.stringify(aux) )
                    return true
                }else{
                    console.error("No se encuentra el carrito")
                    return {error: "Can't find cart with given ID"}
                }
                
            })
            .catch(error=>{
                console.error("Can't destroy cart.",error)
                
            })

    }
    
    
}
