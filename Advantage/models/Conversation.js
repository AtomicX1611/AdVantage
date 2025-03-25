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
