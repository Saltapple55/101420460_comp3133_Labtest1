//const { use } = require("bcrypt/promises");

//initialize socket.io for client access

const usertoken=localStorage.getItem('token')
let currentroom=null;
let privatechatting=false;
const clientIO= io()

const logsDiv = document.getElementById('event-log');



document.addEventListener("DOMContentLoaded", function() {
    // Fetch the list of users from the API
    console.log("getting users")
    fetch("/api/usernames") // Adjust the endpoint as needed
        .then(response => response.json())
        .then(users => {
            // Find the select element
            const userSelect = document.getElementById("user-select");
            
            // Loop through the user array and add each user as an option in the select list
            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.username;  // Assuming each user object has a 'username' property
                option.textContent = user.username; // Display the username in the dropdown
                userSelect.appendChild(option);  // Add the option to the select element
            });
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });
});
function sendMessage() {
    const sendButton = document.getElementById("msg");
    console.log("sending message from button")
    console.log(`current room is ${currentroom}`)
    console.log(`is private chatting: ${privatechatting}`)

    if (currentroom) {
        sendRoomMessage(); // Set button to send room message
    } else if (privatechatting) {
        sendChatMessage(); // Set button to send private message
    } else {
        alert("Please join a room or select a user to chat.");
    }
}

const logEvent = (message) => {
    const logEntry = document.createElement('p');
    logEntry.classList.add('log-entry');
    logEntry.textContent = message;
    logsDiv.appendChild(logEntry);
    logsDiv.scrollTop = logsDiv.scrollHeight; 
};


async function fetchEventLogs(msgType, room, user2="") {
    let response;
    
    try {
        if(msgType==="Room"){
            console.log("getting rooms")
            response = await fetch(`/api/groupmessage/${room}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
        
        }
        else{
            console.log(`getting messages with ${room} and ${user2}`)
            console.log(`user2 is `+user2)

            response = await fetch(`/api/privatemessage/${room}/${user2}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
        }
    
      const logs = await response.json();
      console.log(`got logs for ${msgType} `)
      
      // Update the event log section with the fetched logs
      const eventLogElement = document.getElementById('event-log');
      eventLogElement.innerHTML = ''; // Clear previous logs
      if(logs){
      logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.textContent = `${log.from_user} sent: ${log.message}`; // You can customize this further
        eventLogElement.appendChild(logElement);
      });
    }
    } catch (error) {
      console.error('Error fetching event logs:', error);
    }
  }



const joinChat = () => {
    const userto = document.getElementById("user-select").value;
    if(currentroom!=null){
        leaveRoom()
    }
    privatechatting=true;
    clientIO.emit('join-chat', userto)
};

const joinRoom =()=> {
    const room = document.getElementById("room-select").value;
    document.getElementById("chat-name").textContent = room;
    //logEvent(`${usertoken} joined ${room}`);
    privatechatting=false;
    clientIO.emit('join-room', room)
    currentroom=room;
};

const leaveRoom =()=>{
    clientIO.emit('leave-room', currentroom)
    currentroom=null


}

const sendRoomMessage = async () => {
    //logEvent('Chat button clicked');
    const room = document.getElementById("room-select").value;
    const username=localStorage.getItem('token')
    const message=document.getElementById('message-input').value
    if(message.trim()){
        const data = { "from_user": username, "room": room, "message": message };
        console.log("Sending data:", data);
        try {
            const response = await fetch(`/api/groupmessage/${room}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            clientIO.emit('send-room-message', currentroom)

            const result = await response.json();
    
            
        } catch (error) {
            console.error("Error:", error);
        }
        //fetchEventLogs(currentroom, "Room")
        //logEvent(`${username} sent: ${message}`)
    }else{
        //logEvent(`Message is empty. Can't send.`)
    }
};

const sendChatMessage = async () => {
    //logEvent('Chat button clicked');
    const userto = document.getElementById("user-select").value;
    const userfrom=localStorage.getItem('token')
    const message=document.getElementById('message-input').value
    if(message.trim()){    
        const data = { "from_user": userfrom, "to_user": userto, "message": message, "date": Date.now() };
        console.log("Sending chat data:", data);
        try {
            const response= await fetch(`/api/privatemessage/${userfrom}/${userto}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
            console.log("sending successful")
            
        } catch (error) {
            console.error("Error:", error);
        }
        clientIO.emit('send-chat-message', { from_user: userfrom, to_user: userto })
        //logEvent(`${userfrom} sent: ${message}`)
    }
};


clientIO.on('get-room-logs', (res)=>{
    const room = document.getElementById("room-select").value;
    console.log(`Fetching event logs for room: ${room}`);
    const mgsType="Room"
    fetchEventLogs(mgsType, room); 

})
clientIO.on('get-chat-logs', (res)=>{
    const userto = document.getElementById("user-select").value;
    console.log(`Fetching event logs for chat: ${userto}`);
    const mgsType="Chat"
    fetchEventLogs(mgsType, usertoken, userto); 

})
clientIO.on("new-room-message", (room) => {
    console.log(room)
    console.log("updating room")
    fetchEventLogs("Room", room);
});

clientIO.on("new-chat-message", (data) => {
    console.log("updating chat")
    fetchEventLogs("Chat", data.from_user, data.to_user);
});



