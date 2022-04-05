const socket = io();
const container = document.getElementById("productsContainer")
const chatForm = document.getElementById("chatForm")
const chatMessages = document.getElementById("chatMessages")

const author = new normalizr.schema.Entity('author', {}, {idAttribute: 'email'});
    const text = new normalizr.schema.Entity('text', { author: author },{ idAttribute: 'id' });
    const messagesCenter= new normalizr.schema.Entity('messagesCenter', 
        {
            authors: [author],
            messages: [text]
        }, 
        { idAttribute: 'id' }
    );

const miniCard = (data) =>{
    return(
        `
        <div class="miniCard">
            <img src="${data.thumbnail}" alt="${data.title}"/>
            <p class="text-center">${data.title}</p>
        </div>
        `
    )
    
}
const chatLine= (data) =>{
    return(
        `
            <p>
                <b>${data.author.email} </b>
                <i class="text-success">
                    ${data.text}
                </i>
            </p>
        `
    )
}

socket.on("message",data =>{
    console.log(data)
})
socket.on("products",data=>{
    let aux = ""
    data.forEach(el=>{
        aux += miniCard(el)
    })
    container.innerHTML = aux
})
socket.on("addedProduct",data=>{
    container.prepend(miniCard(data))
})

socket.on("chat",data =>{
    if (data.length > 0){
        const denormalized = [normalizr.denormalize(data.result, messagesCenter, data.entities)]
        let aux = ""
        denormalized.forEach(el=>{
            aux += chatLine(el)
        })
        chatMessages.innerHTML = aux
    }
})

socket.on("newMessage",res =>{
    console.log(res)
    const data = normalizr.denormalize(res.result, messagesCenter, res.entities)
    console.log(data)
    chatMessages.innerHTML += chatLine(data)
})

const messageDeliver= (e) =>{
    e.preventDefault()

    const message = {
        id: 'messages',
        author:{
            email: chatForm.email.value,
            name: chatForm.name.value,
            lastName: chatForm.lastName.value,
            age: chatForm.age.value,
            nickname: chatForm.nickname.value,
        },
        text: chatForm.message.value,
    }
    socket.emit("sendMessage", normalizr.normalize(message,messagesCenter))
}

chatForm.addEventListener("submit",messageDeliver)