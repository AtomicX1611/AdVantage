import Managers from "../models/Managers.js";

export const getManagerById= async (id)=>{
    return await Managers.findById(id);
}

export const findManagerByEmail = async (email) => {
    // console.log(email);
    // console.log(await Managers.find());
    return await Managers.findOne({ email });
};