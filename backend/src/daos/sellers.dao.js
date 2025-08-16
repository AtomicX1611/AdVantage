import Sellers from "../models/Sellers.js";

export const getSellerById= async (id)=>{
    return await Sellers.findById(id);
}

export const createSeller = async (sellerData) => {
    return await Sellers.create(sellerData);
};

export const findSellerByEmail = async (email) => {
    return await Sellers.findOne({ email });
};

export const updateSellerById = async (sellerId, updateData) => {
    return await Sellers.findByIdAndUpdate(
        sellerId,
        { $set: updateData },
        { new: true }
    );
};

export const updateSellerPassById = async (sellerId, newPassword) => {
    return await Sellers.findByIdAndUpdate(
        sellerId,
        { $set: { password: newPassword } },
        { new: true }
    );
};