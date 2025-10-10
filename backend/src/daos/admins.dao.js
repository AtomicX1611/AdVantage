import Admins from "../models/Admins.js";
import sellers from "../models/Sellers.js";
import buyers from "../models/Buyers.js";
import products from "../models/Products.js";

export const getAdminById= async (id)=>{
    return await Admins.findById(id);
}

export const findAdminByEmail = async (email) => {
    return await Admins.findOne({ email });
};

export const getSellers = async () => {
  try {
    const result = await sellers.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "seller",
          as: "products",
        },
      },
      {
        $project: {
          username: 1,
          contact: 1,
          email: 1,
          password: 1,
          subscription: 1,
          numberOfProducts: { $size: "$products" }
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { success: false, message: "No sellers found", sellers: [] };
    }

    return { success: true, sellers: result };

  } catch (error) {
    console.error("Error in getSellers DAO:", error);
    return { success: false, message: "Database error while fetching sellers", sellers: [] };
  }
};


export const getBuyers = async () => {
  try {
    const result = await buyers.find();

    if (!result || result.length === 0) {
      return { success: false, message: "No buyers found", users: [] };
    }

    return { success: true, users: result };
  } catch (error) {
    console.error("Error in getBuyers DAO:", error);
    return { success: false, message: "Database error while fetching buyers", users: [] };
  }
};

export const getProducts = async () => {
    return products.aggregate([
        {
          $group: {
            _id: "$seller",
            productCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "sellers",
            localField: "_id",
            foreignField: "_id",
            as: "sellerInfo"
          }
        },
        {
          $unwind: "$sellerInfo"
        },
        {
          $project: {
            _id: 0,
            username: "$sellerInfo.username",
            productCount: 1
          }
        }
      ]);
}

export const removeSellerById = async (userId) => {
  try {
    if (!userId) {
      return { success: false, message: "Seller ID is required" };
    }
    console.log("id in backend : ",userId);
    
    const seller = await sellers.findOneAndDelete({ _id: userId });

    if (!seller) {
      return { success: false, message: "Seller not found" };
    }
    
    await products.deleteMany({ seller: seller._id, sold: { $lt: 2 } });
    
    return {
      success: true,
      seller
    };

  } catch (error) {
    console.error("Error in removeSellerById DAO:", error);
    return { success: false, message: "Database error while removing seller" };
  }
};
