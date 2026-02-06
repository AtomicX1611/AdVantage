import PendingUser from "../models/PendingUser.js";

export const deletePendingUser = async(email)=> {
    try {
        await PendingUser.deleteOne({email:email});
    } catch (error) {
        console.log("at del pending user: ",error);
    }
}

export const createPendingUser = async(username, contact, email, password,otp)=>{
    try {
        await PendingUser.create({
            username:username,
            contact:contact,
            email:email,
            password:password,
            otp:otp,
            createdAt:Date.now()
        })
    } catch (error) {
        console.log("at create pending user: ",error);
    }
}

export const findPendingUserByEmail = async (email)=> {
    try {
        const user = await PendingUser.findOne({email:email});
        return user
    } catch (error) {
        console.log(error);
    }
}