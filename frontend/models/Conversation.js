export let conversation = [
    {
        sender: "sk@gmail.com",
        senderUsername: "Sk",
        senderRole: "",
        receiver: "abc@gmail.com",
        receiverRole: "buyer",
        message: "hi i am sk",
        date: ""
    },
    {
        sender: "abc@gmail.com",
        senderUsername: "abc",
        senderRole: "",
        receiver: "sk@gmail.com",
        receiverRole: "buyer",
        message: "hi i am abc",
        date: ""
    },
    {
        sender: "abc2@gmail.com",
        senderUsername: "dummySender2",
        senderRole: "",
        receiver: "abc@gmail.com",
        receiverRole: "buyer",
        message: "hi i am dummySender2",
        date: ""
    },
    {
        sender: "abc3@gmail.com",
        senderUsername: "dummySender3",
        senderRole: "",
        receiver: "abc@gmail.com",
        receiverRole: "buyer",
        message: "hi i am dummySender3",
        date: ""
    }
]

export const fetchConversations = (receiverMail,senderMail) => {
    console.log("fetching for ",receiverMail,senderMail);
    let fetchedConvo = [];
    for (let i = 0; i < conversation.length; i++) {
        if((conversation[i].receiver==receiverMail && conversation[i].sender==senderMail) ||
        (conversation[i].receiver==senderMail && conversation[i].sender==receiverMail)) {
            fetchedConvo.push(conversation[i]);
        }
    }
    return fetchedConvo;
}

export const senderList = (email, role) => {
    let senders = [];
    let uniqueSenders = new Set();

    for (let i = 0; i < conversation.length; i++) {
        if (conversation[i].receiver === email && conversation[i].receiverRole === role) {
            let sender = conversation[i].sender;
            if (!uniqueSenders.has(sender)) {
                uniqueSenders.add(sender);
                senders.push({
                    senderUsername: conversation[i].senderUsername,
                    sender: sender
                });
            }
        }
    }
    return senders;
};


// const conversationSchema = new mongoose.Schema({
//     sellerMail: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true
//     },
//     sender: {
//         type: String,
//         default: null,
//         trim: true,
//         lowercase: true
//     },
//     buyerMail: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true
//     },
//     message: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     date: {
//         type: Date,
//         required: true,
//         default: Date.now
//     }
// }, {
//     collection: 'conversation'
// });

// const Conversation = mongoose.model('Conversation', conversationSchema);




// export const findMessages = async (seller, buyer) => {
//     try {
//         const rows = await Conversation.find({ buyerMail: buyer, sellerMail: seller }, 'sellerMail');
//         return rows;
//     } catch (err) {
//         throw err;
//     }
// };

// export const createContact = async (seller, buyer) => {
//     try {
//         const date = new Date();
//         const message = '__init';

//         await Conversation.create({
//             sellerMail: seller,
//             buyerMail: buyer,
//             message: message,
//             date: date
//         });

//         return {
//             message: 'Contact created successfully!',
//             sellerMail: seller,
//             buyerMail: buyer,
//             date: date
//         };
//     } catch (err) {
//         throw err;
//     }
// };

// export const fetchConversations = async (sellerMail, buyerMail) => {
//     console.log("entered fetchConversations in user.js", sellerMail, buyerMail);
//     try {
//         const rows = await Conversation.find({
//             $or: [
//                 { sellerMail: sellerMail, buyerMail: buyerMail },
//                 { sellerMail: buyerMail, buyerMail: sellerMail }
//             ]
//         }).sort({ date: 1 });
//         return rows;
//     } catch (err) {
//         throw err;
//     }
// };


// export const saveMessage = async (sellerMail, buyerMail, message, sender) => {
//     try {
//         const currentDateTime = new Date();

//         await Conversation.create({
//             sellerMail,
//             sender,
//             buyerMail,
//             message,
//             date: currentDateTime
//         });

//         return {
//             sellerMail,
//             sender,
//             buyerMail,
//             message,
//             date: currentDateTime
//         };
//     } catch (err) {
//         throw err;
//     }
// };


