import { createContactDao, 
    fetchContacts,
} 
from "../daos/chat.dao.js"

export const getContactsService=async(_id)=>{
    return await fetchContacts(_id);
}

export const createContactService= async(userId,otherId)=>{
    return await createContactDao(userId,otherId);
}