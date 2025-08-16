import Admins from "../models/Admins.js";

export const getAdminById= async (id)=>{
    return await Admins.findById(id);
}

export const findAdminByEmail = async (email) => {
    return await Admins.findOne({ email });
};
