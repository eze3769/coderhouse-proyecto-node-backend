const fs = require('fs')

class Contenedor{
    constructor(url){
        this.url = url
    }
    async getAll(){
        const url = this.url
            
            try{
                let res = await fs.promises.readFile(url, "utf-8")
                res = JSON.parse(res) || null
                return res
            }
            catch(error){
                console.log("No se pudo encontrar el archivo.")
            }
            
        
        
    }
    save(object){
        const url = this.url
        let aux = object
        this.getAll()
            .then(async (res)=>{
                try{
                    let data = res || []
                    if (data == []){
                        aux.id = 1
                        await fs.promises.writeFile(url, JSON.stringify([...aux])) 
                    }else{
                        let id = data.length + 1
                        while (data.some(el =>el.id == id)){
                            id++
                        }
                        aux.id = id
                        data = [...data, aux]
                        await fs.promises.writeFile(url, JSON.stringify(data)) 
                    }
                    return true
                    
                }
                catch(error){
                    console.log("No se pudo guardar.", error)
                    return false
                }
            })

    }
    getById(id){
        this.getAll()
        .then(el=>{
            let search = el.find(el=> el.id ==id)
            if(search){
                return search
            }else{
                console.log("no se encontró ninguna coincidencia")
            }
            
        })
        .catch(error =>{
            console.warning("No se pudo resolver la consulta.")
        })
    }
    deleteById(id){
        const url = this.url
        this.getAll()
        .then(async el=>{
            let aux = el.filter(el=> el.id !=id)
            await fs.promises.writeFile(url, JSON.stringify(aux) )
                    console.log(`Se borro el elemento con id #${id}`)
        })
        .catch(error=>{
            console.log("No se pudo eliminar el objeto.",error)
        })
    }
    async deleteAll(){
        const url = this.url
        try{
            await fs.promises.writeFile(url, JSON.stringify([]))
            console.log("Los objetos se borraron satisfactoriamente")
        }
        catch(error){
            console.log("No se pudo borrar los elementos",error)
        }
        
            
    }
}


module.exports = {Contenedor}
