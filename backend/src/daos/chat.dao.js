import { Contacts } from "../models/Contact.js" // why the hell chat.dao is accessing models directly?
import Buyers from '../models/Users.js' // why the hell chat.dao is accessing models directly?
import { Messages } from '../models/Messages.js'
import Users from "../models/Users.js";
// import Sellers from '../models/Sellers.js' // why the hell chat.dao is accessing models directly?

export const generateChatId = (user1, user2) => {
    return [user1, user2].sort().join('_');
}

// export const fetchContacts = async (_id) => {
//     try {
//         // returns List of _ids
//         let user = await Contacts.findOne({ user: _id });
//         let contacts;

//         if (!user) {
//             return {
//                 success: false,
//                 message: "No Chats or Contacts found with your id"
//             }
//         }

//         let userName;
//         const buyer = await Buyers.findById(_id);  // To check if present in buyer
//         const seller = await Sellers.findById(_id);  // To check if present in Seller

//         if (buyer) {
//             userName = buyer.username;
//             contacts = await Buyers.find({ _id: { $in: user.contacts } });
//             return {
//                 success: true,
//                 contacts: contacts,
//                 userName: userName
//             }
//         }
//         else if(seller) {
//             userName=seller.username;
//             contacts = await Sellers.find({ _id: { $in: user.contacts } });
//             return {
//                 success: true,
//                 contacts: contacts,
//                 userName: userName
//             }
//         }
//         // To retrive userName
//         // if (!buyer) {
//         //     seller = await Sellers.findById(_id);
//         //     userName = seller.username;
//         //     contacts = await Buyers.find({ _id: { $in: user.contacts } })  // To get complete document of contacts
//         // }
//         // else {
//         //     userName = buyer.username
//         //     contacts = await Sellers.find({ _id: { $in: user.contacts } }) // To get Complete document of contacts
//         // }


//         // return {
//         //     success: true,
//         //     contacts: contacts,
//         //     userName: userName
//         // }
//     } catch (error) {
//         console.log(error);
//         return {
//             success: false,
//             message: "Database error"
//         }
//     }
// }

// export const createContactDao = async (userId, otherId) => {
//     try {
//         let user = await Contacts.findOne({ user: userId });

//         if (!user) {
//             const chatId = generateChatId(userId, otherId);
//             const newUser = new Contacts({
//                 user: userId,
//                 contacts: [otherId],
//                 chatId: chatId
//             });
//             await newUser.save();

//             const newUser2= new Contacts({
//                 user:otherId,
//                 contacts:[userId],
//                 chatId:chatId
//             });
//             await newUser2.save();
//             return  {
//                 success:true,
//                 message:"Created contact successfully"
//             }
//         } else {
//             if (!user.contacts.includes(otherId)) {
//                 user.contacts.push(otherId);
//                 await user.save();
//                 return {
//                     success: true,
//                     message: "Created contact successfully"
//                 };
//             }
//             else {
//                 return {
//                     success: true,
//                     message: "Already in Contact, redirect"
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         return {
//             success: false,
//             message: "Database error"
//         };
//     }
// };

export const fetchContacts = async (_id) => {
    try {
        let user = await Contacts.findOne({ user: _id }); // returns array of _ids
        let contacts;

        if (!user) {
            return {
                success: false,
                message: "No Chats or Contacts found with your id"
            }
        }

        let userName;
        const buyer = await Buyers.findById(_id);  //username of current user

        if (!buyer) {
            return {
                success: false,
                message: "No record found ,please try logging in"
            }
        }

        userName = buyer.username;
        contacts = await Buyers.find({ _id: { $in: user.contacts } }); // Know what you want from here
        return {
            success: true,
            contacts,
            userName,
            myAccount:_id
        };

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
        const userDoc = await Users.findById(userId);
        const otherDoc = await Users.findById(otherId);

        if (!userDoc || !otherDoc) {
            return {
                success: false,
                message: "One or both users not found"
            };
        }

        await Contacts.findOneAndUpdate(
            { user: userId },
            { 
                $addToSet: { contacts: otherId },
                $setOnInsert: { chatId: `chat_${userId}` } 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await Contacts.findOneAndUpdate(
            { user: otherId },
            { 
                $addToSet: { contacts: userId },
                $setOnInsert: { chatId: `chat_${otherId}` } // Satisfies schema requirement
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return {
            success: true,
            message: "Contact connection ensured in both directions"
        };

    } catch (error) {
        console.error("Error in createContactDao:", error);
        return { success: false, message: "Database error" };
    }
};


export const inboxDao = async (userId, otherId) => {
    try {
        let u1 = await Buyers.findById(userId);
        let u2 = await Buyers.findById(otherId);

        if (!u1 || !u2) {
            return {
                success: false,
                status: 404,
                message: "one or both users not found"
            }
        }

        const chatId = generateChatId(userId, otherId);
        let messages = await Messages.find({ chatId: chatId });
        return {
            success: true,
            status: 200,
            message: "Messages retrieved successfully",
            messages: messages
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: "Database error"
        }
    }
}

export const saveDao = async (userId, otherId, newMessage) => {
    try {
        let u1 = await Buyers.findById(userId);
        let u2 = await Buyers.findById(otherId);

        if (!u1 || !u2) {
            return {
                success: false,
                status: 404,
                message: "one or both users not found"
            }
        }

        const chatId = generateChatId(userId, otherId);
        const sender = newMessage.sender;
        const message = newMessage.message;

        const saveMsg = new Messages({
            chatId: chatId,
            sender: sender,
            message: message
        });

        await saveMsg.save()

        return {
            success: true,
            status: 200,
            message: "Saved message successfully"
        }
    } catch (error) {
        return {
            success: false,
            message: "Database error",
            status: 500
        }
    }
}