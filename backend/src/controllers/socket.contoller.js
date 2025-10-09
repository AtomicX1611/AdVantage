import Buyers from "../models/Buyers.js";
import Sellers from "../models/Sellers.js";
import { io } from "../../app.js";

let activeUsers=[];

export const socketActions=(socket)=>{
    socket.on("connect",()=>{console.log(socket.id)});
    socket.on("buyer-register",(data)=>{
        let user={
            _id:data._id,
            role:"buyer",
            socketId:socket.id
        }
        activeUsers.push(user);
        console.log("updated active users: ",activeUsers);
    });

    socket.on("seller-register",(data)=>{
        let seller={
            _id:data._id,
            role:"seller",
            socketId:socket.id
        }
        activeUsers.push(seller);
        console.log("updated active users: ",activeUsers);
    });

    socket.on("send",(data)=>{
        console.log("data in send event: ",data);
        const sender=data.sender // should be _id
        const receiver=data.receiver // should be _id
        const receiverSocketId=activeUsers.find((user)=>user._id === receiver);
        if(!receiverSocketId) {
            console.log("User offline");
            return ;
        }
        const messageData={
            sender:sender,
            receiver:receiver,
            message:data.message
        }
        console.log("emitting to ",receiverSocketId.socketId);
        io.to(receiverSocketId.socketId).emit("newMessage",messageData);
    })

    socket.on("typing",(data)=>{
        const sender=data.sender //should be _id
        const receiver=data.receiver // should be _id
        const receiverSocketId=activeUsers.find((user)=>user._id === receiver);

        if(!receiverSocketId) {
            console.log("Something went wrong on serverside");
            return ;
        }
        const messageData= {
            sender:sender
        }
        io.to(receiverSocketId).emit("isTyping",messageData)
    });

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("Updated activeUsers : ", activeUsers);
    });
}