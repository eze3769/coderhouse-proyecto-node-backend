import fs from "fs"
const url ='./db/persistence.txt'

export default class Products{
    
    
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
                console.log(search)
                return search
            }else{
                console.log("no se encontró ninguna coincidencia")

                return {error: "no se encontro"}
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
                        await fs.promises.writeFile(url, JSON.stringify(aux)) 
                      
                    }else{
                        let id = data.length + 1
                        while (data.some(el =>el.id == id)){
                            id++
                        }
                        aux.id = id
                        data = [...data, aux]
                        await fs.promises.writeFile(url, JSON.stringify(data)) 
                       
                    }
                    
                    return aux
                    
                }
                catch(error){
                    console.log("No se pudo guardar.", error)
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
            aux[index].title = object.title || ""
            aux[index].price = object.price || ""
            aux[index].thumbnail = object.thumbnail || ""

            await fs.promises.writeFile(url, JSON.stringify(aux) )
        
        })
        .catch(error=>{
            console.log("No se pudo eliminar el objeto.",error)
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
                    console.error("No se encuentra el producto")
                    
                }
                
            })
            .catch(error=>{
                console.error("No se pudo eliminar el objeto.",error)
                
            })

}
}
