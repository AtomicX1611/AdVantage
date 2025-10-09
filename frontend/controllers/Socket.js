import { Server } from "socket.io";
// import { io } from "../index.js";
let activeUsers=[];

export const sock=(socket) => {
    console.log("socket id: ", socket.id);
    
    socket.on("buyer-register",(email)=>{
        let user={
            email:email,
            role:"buyer",
            socketId:socket.id
        }
        activeUsers.push(user);
        console.log("updated active users: ",activeUsers);
    });

    socket.on("seller-register",(email)=>{
        let seller={
            email:email,
            role:"seller",
            socketId:socket.id
        };
        activeUsers.push(seller);
        console.log("updated active users: ",activeUsers);
    });
    
    socket.on("send",(data)=>{
        let sender=data.sender;
        let receiver=data.receiver;
        let message=data.message;
        let socketId=findUserSocketByMail(receiver);

        if(socketId) {
            console.log("event emmited to: ",socketId);
            io.to(socketId).emit("newMessage",(data));
        }
    })

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("Updated activeUsers : ", activeUsers);
    });
}

function findUserBySocket(socketId) {
    for(let i=0;i<activeUsers.length;i++) {
        if(activeUsers[i].socketId==socketId) {
            return activeUsers[i];
        }
    }
}

function findUserSocketByMail(email) {
    for(let i=0;i<activeUsers.length;i++) {
        if(activeUsers[i].email==email) {
            return activeUsers[i].socketId;
        }
    }
}