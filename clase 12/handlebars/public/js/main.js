const socket = io();
const container = document.getElementById("productsContainer")
const chatForm = document.getElementById("chatForm")
const chatMessages = document.getElementById("chatMessages")

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
                <b>${data.email} </b>
                <span class="text-brown">
                    [${data.time}]:
                </span>
                <i class="text-success">
                    ${data.message}
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

socket.on("chat",data=>{
    if (data !== []){
        let aux = ""
        data.forEach(el=>{
            aux += chatLine(el)
        })
        chatMessages.innerHTML = aux
    }
})

socket.on("newMessage",data =>{
    chatMessages.innerHTML += chatLine(data)
})

const messageDeliver= (e) =>{
    e.preventDefault()

    const message = {
        email: chatForm.email.value,
        time: new Date().toDateString(),
        message: chatForm.message.value
    }

    socket.emit("sendMessage", message)
}

document.addEventListener("submit",messageDeliver)