import { Contacts } from "../models/Contact.js"
import Buyers from '../models/Buyers.js'
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
