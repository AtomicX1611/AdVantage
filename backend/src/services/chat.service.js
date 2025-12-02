import { createContactDao, 
    fetchContacts,
    inboxDao,
    saveDao
} 
from "../daos/chat.dao.js"
import { createNotification, notificationTemplates } from "../utils/notificationHelper.js";
import { getBuyerById } from "../daos/users.dao.js";

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
    const result = await saveDao(userId,otherId,newMessage);
    
    // Send notification for new message
    if (result && result.success) {
        const sender = await getBuyerById(userId);
        if (sender) {
            const notifData = notificationTemplates.NEW_MESSAGE(sender.username);
            await createNotification({
                fromId: userId,
                fromModel: 'Users',
                toId: otherId,
                toModel: 'Users',
                type: notifData.type,
                title: notifData.title,
                description: notifData.description,
                relatedEntityId: null,
                relatedEntityType: 'Message',
                priority: notifData.priority
            });
        }
    }
    
    return result;
}