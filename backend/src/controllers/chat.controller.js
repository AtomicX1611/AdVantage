import { getContactsService,
    createContactService
 } from "../services/chat.service.js"

export const getContacts=async (req,res)=> {
    try {
        const userId=req.user._id;
        if(!userId) {
            return res.status(404).status({
                success:false,
                message:"UserId not found"
            })
        }
        let response=await getContactsService(userId);
        console.log("response on backedn in getContacts",response);
        if(!response.success) return res.status(500).json({
            success:false,
            message:response.message
        })
        return res.status(200).json({
            success:true,
            contacts:response.contacts,
            userName:response.userName
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const createContact=async (req,res)=> {
    try {
        const userId=req.user._id;
        const otherUserId=req.params.id;

        if(!userId || otherUserId) return res.status(400).json({
            sucess:false,
            message:"Missing fields to create contact"
        })
        let response=await createContactService(userId,otherUserId);
        if(!response.success) {
            return res.status(500).json({
                success:false,
                message:response.message
            })
        }
        return res.status(200).json({
            success:true,
            message:"Contact Created"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}