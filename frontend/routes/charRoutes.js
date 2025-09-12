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
import { buyerMiddleWare, sellerMiddleware } from "../middleware/roleMiddleware.js";
export const chatRoutes = express();

// Load buyer Inbox
chatRoutes.get("/buyerInbox", buyerMiddleWare, async (req, res) => {
    // Pass _id as my account for this page
    // Find userName in /getContact response and pass it 
    const userId = req.user; // this is _id 
    let request = await fetch('http://localhost:3000/chat/contacts', {
        method: 'GET',
        credentials:"include",
        headers: {
            "Content-Type": "application/json",
            cookie: req.headers.cookie || "",
        },
    });
    let response=await request.json();
    if(!response.success) {
        return res.send(response.message);
    }
    res.render("buyerChat.ejs", { isLogged: true, senders: response.contacts, myAccount: userId, myUsername: response.userName });
});

// Call create contact here 
chatRoutes.get("/contact/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const buyer = req.user.email;
        const seller = req.params.id;
        console.log("seller in /contact: ", seller);
        const result = await findMessages(seller, buyer);
        if (result.length == 0) {
            await createContact(seller, buyer);
        }
        res.redirect("/buyer/chats/buyerInbox");
    }
    else {
        res.redirect("/auth/buyer");
    }
})
// Unknown
chatRoutes.get("/contact", (req, res) => {
    res.send("seller account is deleted");
});

chatRoutes.post("/save", async (req, res) => {
    let { sellerMail, buyerMail, message, sender } = req.body;
    let saved = await saveMessage(sellerMail, buyerMail, message, sender);
    console.log("saved message: ", saved);
});

chatRoutes.get("/conversation", async (req, res) => {
    console.log("req.query", req.query);
    let sender = req.query.sender;
    let receiver = req.user.email;
    let data = await fetchConversations(receiver, sender);
    console.log("data in conversations :", data);
    res.status(200).json({ messages: data });
});

chatRoutes.get("/sellerInbox", sellerMiddleware, async (req, res) => {
    const userId = req.user // this is _id
    // Find userName
    //Find sendersList
    // Find userName
    let request=await fetch("http://localhost:3000/chat/contacts",{
        method:'GET',
        credentials:"include",
        headers: {
            "Content-Type": "application/json",
            cookie: req.headers.cookie || "",
        },
    });
    let response=await request.json();
    if(!response.success) {
        return res.send(response.message);
    }

    res.render("sellerChat.ejs", { isLogged: true, senders:response.contacts, myAccount: userId,myUsername:response.userName});
})