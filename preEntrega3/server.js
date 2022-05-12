import { createServer } from "http";
import { Server } from "socket.io";
import Products from './models/Products.js';
import Messages from './models/Messages.js';
import { config } from 'dotenv';
import { app } from './routes.js';

config()


const httpServer = createServer(app);
const io = new Server(httpServer)
const PORT = process.env.PORT || 8080;

const server = httpServer.listen(PORT,()=>{
    console.log(`Servidor PID-${process.pid} escuchando en el puerto ${server.address().port}`)
})

server.on("error", error =>console.log(`Error en servidor: ${error}`))

//Websockets

io.on("connection", async(socket)=>{
    console.log("user connected. ID:",socket.id)
    socket.emit("message", "connected to websocket")
    const products = await Products.find({});
    try {
        socket.emit("products", products)
    } catch (error) {
        res.status(500).send(error);
    }
    const messages = await Messages.find({})
    try {
        socket.emit("chat", messages)
    } catch (error) {
        res.status(500).send(error);
    }
  
    socket.on("sendMessage", async(data) =>{
        const messages = new Messages(req.body);
        try {
            await messages.save();
            io.sockets.emit("newMessage",data)
        } catch (error) {
            res.status(500).send(error);
        }
    
    })
    socket.on("receivedMessage", data =>{
        
    })
})

