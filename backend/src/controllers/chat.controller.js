import {
    getContactsService,
    createContactService,
    saveService,
    inboxService
} from "../services/chat.service.js"

import {
    generateChatId,
} from "../daos/chat.dao.js";

export const getContacts = async (req, res, next) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(404).status({
                success: false,
                message: "UserId not found"
            })
        }
        let response = await getContactsService(userId);  // Error is here

        if (!response.success) return res.status(500).json({
            success: false,
            message: response.message
        })
        return res.status(200).json({
            success: true,
            contacts: response.contacts,
            userName: response.userName,
            myAccount: response.myAccount
        })
    } catch (error) {
        next(error);
    }
}

export const createContact = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.id;
        console.log(otherUserId)
        console.log("hitting createcontact: ",userId);

        if (!userId || !otherUserId) return res.status(400).json({
            success: false,
            message: "Missing fields to create contact"
        })
        let response = await createContactService(userId, otherUserId);
        console.log("response: ", response);
        
        if (!response.success) {
            return res.status(500).json({
                success: false,
                message: response.message
            })
        }
        return res.status(200).json({
            success: true,
            message: "Contact Created"
        })

    } catch (error) {
        next(error);
    }
}

export const inboxController = async (req, res, next) => {
    try {
        console.log("hitting inboxController")
        const userId = req.user._id;
        const otherId = req.params.id;

        if (!userId || !otherId) {
            return res.status(400).json({ message: "Missing parameters" });
        }
        let response = await inboxService(userId, otherId);
        if (!response.success) {
            return res.status(response.status).json({ message: response.message });
        }
        return res.status(response.status).json({
            message:response.message,
            messages:response.messages,
            success:true
        });
    } catch (error) {
        next(error);
    }

}

export const saveController=async (req,res,next)=> {
    try {
        const userId=req.user._id;
        const otherId=req.params.id;
        const {newMessage}=req.body;

        let response=await saveService(userId,otherId,newMessage);
        if(!response.success) {
            return res.status(response.status).json({message:response.message});
        }
        return res.status(200).json({message:response.message});
    } catch (error) {
        next(error);
    }
}