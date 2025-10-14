import { Contacts } from "../models/Contact.js"
import Buyers from '../models/Buyers.js'
import { Messages } from '../models/Messages.js'
import Sellers from '../models/Sellers.js'

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
        // returns List of _ids
        console.log("_id in fetch contacts: ", _id);
        let user = await Contacts.findOne({ user: _id });
        console.log("user: ", user)
        let contacts;

        if (!user) {
            return {
                success: false,
                message: "No Chats or Contacts found with your id"
            }
        }

        let userName;
        const buyer = await Buyers.findById(_id);  // To check if present in buyer
        console.log("Buyer: ", buyer);
        const seller = await Sellers.findById(_id);  // To check if present in Seller
        console.log("seller: ", seller);
        if (!buyer && !seller) {
            return {
                success: false,
                message: "No record found please check your account status"
            }
        }

        if (buyer) {
            userName = buyer.username;
            contacts = await Sellers.find({ _id: { $in: user.contacts } });
            console.log("Contacts in fetchContacts: ",contacts);
            return {
                success: true,
                contacts,
                userName
            };
        } else if (seller) {
            userName = seller.username;
            contacts = await Buyers.find({ _id: { $in: user.contacts } });
            console.log("Contacts in fetchContacts: ",contacts);
            return {
                success: true,
                contacts,
                userName
            };
        }

        // To retrive userName
        // if (!buyer) {
        //     seller = await Sellers.findById(_id);
        //     userName = seller.username;
        //     contacts = await Buyers.find({ _id: { $in: user.contacts } })  // To get complete document of contacts
        // }
        // else {
        //     userName = buyer.username
        //     contacts = await Sellers.find({ _id: { $in: user.contacts } }) // To get Complete document of contacts
        // }


        // return {
        //     success: true,
        //     contacts: contacts,
        //     userName: userName
        // }
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
        let userDoc = await Buyers.findById(userId);
        if (!userDoc) {
            userDoc = await Sellers.findById(userId);
            if (!userDoc) {
                return {
                    success: false,
                    message: "User ID not found"
                };
            }
        }

        let otherDoc = await Buyers.findById(otherId);
        if (!otherDoc) {
            otherDoc = await Sellers.findById(otherId);
            if (!otherDoc) {
                return {
                    success: false,
                    message: "Other ID not found"
                };
            }
        }

        let userContacts = await Contacts.findOne({ user: userId });

        if (!userContacts) {
            const chatId = generateChatId(userId, otherId);

            await Contacts.create({
                user: userId,
                contacts: [otherId],
                chatId
            });

            await Contacts.create({
                user: otherId,
                contacts: [userId],
                chatId
            });

            return {
                success: true,
                message: "Contact created (first time)"
            };
        }

        const alreadyExists = userContacts.contacts.some(
            id => id.toString() === otherId.toString()
        );

        if (!alreadyExists) {
            userContacts.contacts.push(otherId);
            await userContacts.save();
        } else {
            return {
                success: true,
                message: "Already in contacts, redirect"
            };
        }

        let otherContacts = await Contacts.findOne({ user: otherId });

        if (!otherContacts) {
            await Contacts.create({
                user: otherId,
                contacts: [userId],
                chatId: userContacts.chatId // use same chatId
            });
        } else {
            const existsReverse = otherContacts.contacts.some(
                id => id.toString() === userId.toString()
            );

            if (!existsReverse) {
                otherContacts.contacts.push(userId);
                await otherContacts.save();
            }
        }

        return {
            success: true,
            message: "Contact added both ways"
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Database error"
        };
    }
};



export const inboxDao = async (userId, otherId) => {
    try {
        let buyer = Buyers.findById(otherId);
        let seller = Sellers.findById(otherId);

        if (!buyer && !seller) {
            return {
                success: false,
                status: 404,
                message: "User not found with given Id"
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
        let buyer = Buyers.findById(otherId);
        let seller = Sellers.findById(otherId);

        if (!buyer && !seller) {
            return {
                success: false,
                status: 404,
                message: "User not found with given Id"
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