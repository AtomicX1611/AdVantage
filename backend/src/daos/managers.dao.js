import Managers from "../models/Managers.js";

export const getManagerById= async (id)=>{
    return await Managers.findById(id);
}

export const findManagerByEmail = async (email) => {
    // console.log(email);
    // console.log(await Managers.find());
    return await Managers.findOne({ email });
};

export const getAllManagers = async () => {
    return await Managers.find().lean();
};

export const countManagers = async () => {
    return await Managers.countDocuments();
};

export const createManager = async (data) => {
    const manager = new Managers(data);
    return await manager.save();
};