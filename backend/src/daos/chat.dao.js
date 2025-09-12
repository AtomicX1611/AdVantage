import { Contacts } from "../models/Contact.js"
import Buyers from '../models/Buyers.js'
import Sellers from '../models/Sellers.js' 

export const generateChatId = (user1, user2) => {
    return [user1, user2].sort().join('_');
}

export const fetchContacts=async(_id)=> {
    try {
        let user=await Contacts.findOne({user:_id});
        let userName;
        const buyer=await Buyers.findById(_id);
        let seller;
        if(!buyer) {
            seller=await Sellers.findById(_id);
            userName=seller.username;
        }
        else {
            userName=buyer.username
        }
        if(!user) {
            return {
                success:false,
                message:"No Chats or Contacts found"
            }
        }
        return {
            success:true,
            contacts:user.contacts,
            userName:userName
        }
    } catch (error) {
        console.log(error);
        return {
            success:false,
            message:"Database error"
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
        } else {
            if (!user.contacts.includes(otherId)) {
                user.contacts.push(otherId);
                await user.save();
            }
        }
        return { 
            success: true,
            message:"Created contact successfully"
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Database error"
        };
    }
};
