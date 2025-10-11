import { createContactDao, 
    fetchContacts,
    inboxDao,
    saveDao
} 
from "../daos/chat.dao.js"

export const getContactsService=async(_id)=>{
    return await fetchContacts(_id);
}

export const createContactService= async(userId,otherId)=>{
    return await createContactDao(userId,otherId);
}

export const inboxService=async(userId,otherId)=> {
    return await inboxDao(userId,otherId);
}

export const saveService=async(userId,otherId,newMessage)=> {
    return await saveDao(userId,otherId,newMessage);
}