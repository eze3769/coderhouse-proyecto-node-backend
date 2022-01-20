import fs from "fs"
const url ='./db/dataPersistence.txt'

export default class Products{
    
    
    async index(){
        
            try{
                let res = await fs.promises.readFile(url, "utf-8")
                res = JSON.parse(res) || null
                return res
            }
            catch(error){
                console.log("No se pudo acceder a los datos.")
                return {error:"Can't show products. Try later"}
            }
            
        
    }
    show(id){
        const product = this.index()
        .then(el=>{
      
            let search = el.find(el=> el.id ==id)
            if(search){
                console.log(search)
                return search
            }else{
                return {error: "Doesn't match any product with given ID"}
            }
            
        })
        .catch(error =>{
            console.warning("No se pudo resolver la consulta.")
        })
        return product
    }
    create(object){
        let aux = object
        let save = this.index()
            .then(async (res)=>{
                try{
                    let data = res || []
                   
                    if (data == []){
                        aux.id = 1
                        aux.timestamp = Date.now()
                        await fs.promises.writeFile(url, JSON.stringify(aux)) 
                      
                    }else{
                        let id = data.length + 1
                        while (data.some(el =>el.id == id)){
                            id++
                        }
                        aux.id = id
                        aux.timestamp = Date.now()
                        data = [...data, aux]
                        await fs.promises.writeFile(url, JSON.stringify(data)) 
                       
                    }
                    
                    return aux
                    
                }
                catch(error){
                    console.log("Can't save product.", error)
                    return false
                }
            })
            
           return save
        
    }
    update(id, object){
        this.index()
        .then(async el=>{
            let aux = el
            const index = aux.findIndex(el=>el.id == id)
            if(index != -1){
                aux[index].name = object.name 
                aux[index].description = object.description 
                aux[index].imageURL = object.imageURL
                aux[index].price = object.price 
                aux[index].code = object.code 
                aux[index].stock = object.stock 

            await fs.promises.writeFile(url, JSON.stringify(aux) )
            return aux
            }else{
                return {error:"Can't find product with given ID"}
            }
            
        
        })
        .catch(error=>{
            console.log("Can't update object with given ID.",error)
            return {error: "Can't update product with given ID"}
        })

    }
    destroy(id){
        
        this.index()
            .then(async el=>{
                const find = el.find(el=>el.id == id)
                console.log(find)
                if (find){
                   
                    let aux = el.filter(el=> el.id !=id)
                    await fs.promises.writeFile(url, JSON.stringify(aux) )
                    return true
                }else{
                    console.error("No se encuentra el producto")
                    return {error:"Can't find product with given ID"}
                }
                
            })
            .catch(error=>{
                console.error("No se pudo eliminar el objeto.",error)
                return {error: "Can't delete object"}
                
            })

}
}
