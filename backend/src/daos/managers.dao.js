import Managers from "../models/Managers.js";

export const getManagerById= async (id)=>{
    return await Managers.findById(id);
}

export const findManagerByEmail = async (email) => {
    return await Managers.findOne({ email });
};