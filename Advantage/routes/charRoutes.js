import express from "express";
import { conversation } from "../models/Conversation.js";
import { fetchConversations } from "../models/MongoUser.js";
import { senderList } from "../models/MongoUser.js";
import { buyerList } from "../models/MongoUser.js";
import { findUserByEmail } from "../models/MongoUser.js";
import { findSendersForEmail } from "../models/MongoUser.js";
import { findSellerByEmail } from "../models/MongoUser.js";
import { createContact } from "../models/MongoUser.js";
import { findMessages } from "../models/MongoUser.js";
import { saveMessage } from "../models/MongoUser.js";
import { findSendersForSeller } from "../models/MongoUser.js";
import { requireRole } from "../middleware/roleMiddleware.js";
export const chatRoutes = express();

chatRoutes.get("/buyerInbox",requireRole("buyer"),async (req, res) => {
    if (req.isAuthenticated() && req.user.role == "buyer") {
        let results=await findSendersForEmail(req.user.email);
        let senders = await senderList(results);
        console.log("senders in buyerInbox: ",senders);
        
        let user=await findUserByEmail(req.user.email); // this is to pass userName
       
        res.render("buyerChat.ejs", { isLogged: true, senders: senders ,myAccount:req.user.email,myUsername:user.username});
    }
    else {
        res.send("No data!! please login")
    }
});

chatRoutes.get("/contact/:id",async (req,res)=>{
    if(req.isAuthenticated()) {
        const buyer=req.user.email;
        const seller=req.params.id;
        console.log("seller in /contact: ",seller);
        const result=await findMessages(seller,buyer);
        if(result.length==0) {
            await createContact(seller,buyer);
        }
        res.redirect("/buyer/chats/buyerInbox");
    }
    else {
        res.redirect("/auth/buyer");
    }
})
chatRoutes.get("/contact",(req,res)=>{
    res.send("seller account is deleted");
});

chatRoutes.post("/save",async (req,res)=>{
    let {sellerMail,buyerMail,message,sender}=req.body;
    let saved=await saveMessage(sellerMail,buyerMail,message,sender);
    console.log("saved message: ",saved);
});

chatRoutes.get("/conversation",async (req,res)=>{
    console.log("req.query",req.query);
    let sender=req.query.sender;
    let receiver=req.user.email;
    let data=await fetchConversations(receiver,sender);
    console.log("data in conversations :",data);
    res.status(200).json({messages:data});
});

chatRoutes.get("/sellerInbox",async (req,res)=>{
    if (req.isAuthenticated() && req.user.role == "seller") {
        let results=await findSendersForSeller(req.user.email);
        console.log("reults in sellerInbox: ",results);
        let senders = await buyerList(results);
        console.log("senders in sellerInbox: ",senders); //[]
        
        let user=await findSellerByEmail(req.user.email); // this is to pass userName
       
        res.render("sellerChat.ejs", { isLogged: true, senders: senders ,myAccount:req.user.email,myUsername:user.username});
    }
    else {
        res.send("No data!! please login")
    }
})