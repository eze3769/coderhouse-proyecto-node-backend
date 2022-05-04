import { createServer } from "http";
import { Server } from "socket.io";
import Products from './models/Products.js';
import Messages from './models/Messages.js';
import { config } from 'dotenv';
import { argv } from './config.js';
import cluster from 'cluster';
import os from 'os';
import { app } from './routes.js';

config()


const httpServer = createServer(app);
const io = new Server(httpServer)

const numCPUs = os.cpus().length;

const PORT = parseInt(process.argv[2]) || 8080;
const MODE = process.argv[3]?.toUpperCase() || "FORK";

if (MODE === "FORK") {
    console.log("Fork MODE")
    
    const server = httpServer.listen(PORT,()=>{
        console.log(`Servidor PID-${process.pid} escuchando en el puerto ${server.address().port}`)
    })
    
    server.on("error", error =>console.log(`Error en servidor: ${error}`))
} else if (MODE === "CLUSTER") {
    if (cluster.isPrimary) {
        console.log("Cluster MODE")
        console.log(`Primary ${process.pid} is running`)

        for (let i=0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        })
    } else {

        const server = httpServer.listen(PORT,()=>{
            console.log(`Servidor PID-${process.pid} escuchando en el puerto ${server.address().port}`)
        })

        server.on("error", error =>console.log(`Error en servidor: ${error}`))

        console.log(`worker ${process.pid} started`);
    }
};


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

