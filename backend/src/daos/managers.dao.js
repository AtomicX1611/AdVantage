import Managers from "../models/Managers.js";
import Notifications from "../models/Notifications.js";

export const getManagerById= async (id)=>{
    return await Managers.findById(id);
}

export const findManagerByEmail = async (email) => {
    return await Managers.findOne({ email });
};

export const findManagerByCategory = async (category) => {
    return await Managers.findOne({ category });
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
export const removeManagerById = async (managerId) => {
    try {
        if (!managerId) {
            return { success: false, message: "Manager ID is required" };
        }
        const manager = await Managers.findOneAndDelete({ _id: managerId });
        if (!manager) {
            return { success: false, message: "Manager not found" };
        }
        return { success: true, manager };
    } catch (error) {
        console.error("Error in removeManagerById DAO:", error);
        return { success: false, message: "Database error while removing manager" };
    }
};

export const getManagerVerifiedCounts = async () => {
    try {
        const result = await Notifications.aggregate([
            { $match: { senderModel: "Managers", category: "product_verified" } },
            { $group: { _id: "$sender", verifiedCount: { $sum: 1 } } }
        ]);
        // Return as a map: { managerId: count }
        const countsMap = {};
        result.forEach(item => {
            countsMap[item._id.toString()] = item.verifiedCount;
        });
        return countsMap;
    } catch (error) {
        console.error("Error in getManagerVerifiedCounts DAO:", error);
        return {};
    }
};