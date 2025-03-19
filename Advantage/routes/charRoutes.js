import express from "express";
import { conversation } from "../models/Conversation.js";
import { fetchConversations } from "../models/Conversation.js";
import { senderList } from "../models/Conversation.js";
import { findUserByEmail } from "../models/User.js";

export const chatRoutes = express();

chatRoutes.get("/buyerInbox",async (req, res) => {
    console.log("in buyerInbox");
    if (req.isAuthenticated() && req.user.role == "buyer") {
        let senders = senderList(req.user.email, req.user.role);
        console.log("senders: ",senders);
        res.render("buyerChat.ejs", { isLogged: true, senders: senders ,myAccount:req.user.email,myUsername:await findUserByEmail(req.user.email).username});
    }
    else {
        res.send("No data!! please login")
    }
});

chatRoutes.get("/conversation",(req,res)=>{
    let sender=req.query.sender;
    let receiver=req.user.email;
    let data=fetchConversations(receiver,sender);
    res.status(200).json({messages:data});
})