// npm install express socket.io nodemon
// to run the app npx nodemon server.js

const express = require('express')
const app = express()
const path = require('path');
const PORT = process.env.PORT || 3000
//import socket Server object from socket
const {Server} = require('socket.io')
const mongoose = require('mongoose');
const userModel = require('./backend/models/User')
const groupModel = require('./backend/models/GroupMessage')
const pmModel = require('./backend/models/PrivateMessage')


//const messageRouter = require('./backend/routes/Messages.js');
//const userRouter = require('./backend/routes/user.js');

const mongoString=process.env.DATABASE_URL


app.use(express.json()); // Make sure it comes back as json

//TODO - Replace you Connection String here
mongoose.connect('mongodb+srv://saltyapple55:L2eJ1hiNW6I0LirV@cluster0.b9r5q.mongodb.net/comp3133?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

// app.use(userRouter);
// app.use(messageRouter);



app.use(express.static(path.join(__dirname, 'view')));
//start listening to server on PORT
const appServer = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`)
}) 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/login.html'))
})



app.post('/api/login', async (req, res)=>{
    const { username, password } = req.body;
    try {
        const user = await userModel.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        if(user.password!=password){
            res.status(404).send({message: "Password incorrect"})
        }
        else{

              res.status(200).send({
                message: "Login Successful",
                username: user.username,
                token:user.username,
                });
            

        }

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


app.post("/api/signup", async (req,res)=>{
    const userData = req.body
    console.log("getting userData")
    console.log(userData)
    try{
        const user = new userModel(userData)
        const newuser = await user.save()
        res.send(newuser)
    } catch(err){
        res.status(500).send({message: err.message})
    }
})

app.get("/api/usernames", async (req,res)=>{
    try{
        const user = await userModel.find({}).select("username");
        res.send(user)
    } catch(err){
        res.status(500).send({message: err.message})
    }
})

app.get('/api/groupmessage/:room', async (req, res) => {
  const roomid = req.params.room

  const groupMessages = await groupModel.find({room:roomid }).sort({ date_sent: 1 });
  console.log(groupMessages)
  try {
    res.status(200).send(groupMessages);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/groupmessage/:room', async (req, res) => {
    const roomid = req.params.room
    const messageData = req.body
    console.log("posting messageData")
    console.log(messageData)
    try{
        const message = new groupModel(messageData)
        const newmessage = await message.save()
        res.send(newmessage)
    } catch(err){
        res.status(500).send({message: err.message})
    }
  });

//Read By ID
//http://localhost:8081/employee?id=60174acfcde1ab2e78a3a9b0
app.get('/api/privatemessage/:user1/:user2', async (req, res) => {

  const user1 = req.params.user1
  const user2 = req.params.user2

  const chat1 = await pmModel.find({from_user: user1, to_user: user2});
  const chat2 = await pmModel.find({from_user: user2, to_user: user1});

  console.log(chat1)
  const chat = chat1.concat(chat2).sort((a,b)=>new Date(a.date_sent) - new Date(b.date_sent));

  try {
    res.send(chat);
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
});

app.post('/api/privatemessage/:user1/:user2', async (req, res) => {

    const userfrom = req.params.user1
    const userto = req.params.user2
  
    const messageData = req.body
    console.log("getting messageData")
    console.log(messageData)
    try{
        const message = new pmModel(messageData)
        const newmessage = await message.save()
        res.send(newmessage)
    } catch(err){
        res.status(500).send({message: err.message})
    }
  
  });
  


//associate app server with socket server
const io = new Server(appServer)
//console.log(io)

//when client establishes connection to server
//on functions, listens to connection event
io.on("connection", (socket)=>{
    console.log(`Client connected. Client ID: ${socket.id} `)
    //listen for ping event
    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        io.to(room).emit("get-room-logs", room);
        io.to(room).emit("room-message", `A new user joined the ${room} room.`);
    });
    socket.on("leave-room", (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });
    socket.on("join-chat", (userto) => {

        console.log(`User ${socket.id} is chatting: ${userto}`);

        io.emit("get-chat-logs", userto);
    });

    socket.on("send-room-message", async (room) => {
        console.log(`New message in room: ${room}`);
        io.to(room).emit("new-room-message", room); // Notify all users to fetch new logs
    });
    socket.on("send-chat-message", async (data) => {
        console.log(`New message from : ${data.from_user} to ${data.to_user}`);
        io.emit("new-chat-message", data); // Notify all users to fetch new logs
    });
    
    // socket.on('message-sent', (data)=>{
    //     console.log(`Message sent: ${data}`)
    //     //acknowledge message receipt
    //     socket.emit("update-site", data)
    // })

    socket.on("disconnect", ()=>{
        console.log(`Client ${socket.id} disconnected\nPerform necessary wind up operations`)
    })
})
