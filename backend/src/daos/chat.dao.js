import { Contacts } from "../models/Contact.js"
import Buyers from '../models/Buyers.js'
import {Messages} from '../models/Messages.js'
import Sellers from '../models/Sellers.js'

export const generateChatId = (user1, user2) => {
    return [user1, user2].sort().join('_');
}

export const fetchContacts = async (_id) => {
    try {
        // returns List of _ids
        let user = await Contacts.findOne({ user: _id });
        let contacts;

        let userName;
        const buyer = await Buyers.findById(_id);
        let seller;
        
        // To retrive userName
        if (!buyer) {
            seller = await Sellers.findById(_id);
            userName = seller.username;
            contacts=await Buyers.find({_id:{ $in: user.contacts }})  // To get complete document of contacts
        }
        else {
            userName = buyer.username
            contacts=await Sellers.find({_id: { $in: user.contacts }}) // To get Complete document of contacts
        }

        if (!user) {
            return {
                success: false,
                message: "No Chats or Contacts found"
            }
        }
        return {
            success: true,
            contacts: contacts,
            userName: userName
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Database error"
        }
    }
}

export const createContactDao = async (userId, otherId) => {
    try {
        let user = await Contacts.findOne({ user: userId });

        if (!user) {
            const chatId = generateChatId(userId, otherId);
            const newUser = new Contacts({
                user: userId,
                contacts: [otherId],
                chatId: chatId
            });
            await newUser.save();

            const newUser2= new Contacts({
                user:otherId,
                contacts:[userId],
                chatId:chatId
            });
            await newUser2.save();
            return  {
                success:true,
                message:"Created contact successfully"
            }
        } else {
            if (!user.contacts.includes(otherId)) {
                user.contacts.push(otherId);
                await user.save();
                return {
                    success: true,
                    message: "Created contact successfully"
                };
            }
            else {
                return {
                    success: true,
                    message: "Already in Contact, redirect"
                }
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Database error"
        };
    }
};

export const inboxDao=async(userId,otherId) => {
    try {
        let buyer=Buyers.findById(otherId);
        let seller=Sellers.findById(otherId);

        if(!buyer && !seller) {
            return {
                success:false,
                status:404,
                message:"User not found with given Id"
            }
        }

        const chatId=generateChatId(userId,otherId);
        let messages=await Messages.find({chatId:chatId});
        return {
            success:true,
            status:200,
            message:"Messages retrieved successfully",
            messages:messages
        }
    } catch (error) {
        return {
            success:false,
            status:500,
            message:"Database error"
        }
    }
}

export const saveDao = async(userId,otherId,newMessage)=> {
    try {
        let buyer=Buyers.findById(otherId);
        let seller=Sellers.findById(otherId);

        if(!buyer && !seller) {
            return {
                success:false,
                status:404,
                message:"User not found with given Id"
            }
        }

        const chatId=generateChatId(userId,otherId);
        const sender=newMessage.sender;
        const message=newMessage.message;

        const saveMsg=new Messages({
            chatId:chatId,
            sender:sender,
            message:message
        });

        await saveMsg.save()
        
        return {
            success:true,
            status:200,
            message:"Saved message successfully"
        }
    } catch (error) {
        return {
            success:false,
            message:"Database error",
            status:500
        }
    }
}