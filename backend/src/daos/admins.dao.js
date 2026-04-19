import Admins from "../models/Admins.js";
import buyers from "../models/Users.js";
import products from "../models/Products.js";
import PendingPayouts from "../models/PendingPayouts.js";

export const getAdminById= async (id)=>{
    return await Admins.findById(id);
}

export const findAdminByEmail = async (email) => {
    return await Admins.findOne({ email });
};

export const getAllAdmins = async () => {
    return await Admins.find().lean();
};

export const countAdmins = async () => {
    return await Admins.countDocuments();
};

// export const getSellers = async () => {
//   try {
//     const result = await sellers.aggregate([
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "seller",
//           as: "products",
//         },
//       },
//       {
//         $project: {
//           username: 1,
//           contact: 1,
//           email: 1,
//           password: 1,
//           subscription: 1,
//           numberOfProducts: { $size: "$products" }
//         },
//       },
//     ]);

//     if (!result || result.length === 0) {
//       return { success: false, message: "No sellers found", sellers: [] };
//     }

//     return { success: true, sellers: result };

//   } catch (error) {
//     console.error("Error in getSellers DAO:", error);
//     return { success: false, message: "Database error while fetching sellers", sellers: [] };
//   }
// };


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
            from: "users",
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

export const removeUserById = async (userId) => {
  try {
    if (!userId) {
      return { success: false, message: "Seller ID is required" };
    }
    console.log("id in backend : ",userId);
    
    const seller = await buyers.findOneAndDelete({ _id: userId });

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

const WITHDRAWABLE_PAYOUT_TYPES = [
  "Seller_120_Percent",
  "Seller_BuyerPool_Share",
  "Seller_Stake_Release",
];

export const getUsersWithRevenue = async () => {
  try {
    const [allUsers, revenueAgg, productCountAgg] = await Promise.all([
      buyers.find().lean(),
      PendingPayouts.aggregate([
        {
          $match: {
            payoutType: { $in: WITHDRAWABLE_PAYOUT_TYPES },
            status: { $in: ["Pending", "Processed"] },
          },
        },
        {
          $group: {
            _id: "$recipientId",
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      products.aggregate([
        {
          $group: {
            _id: "$seller",
            productCount: { $sum: 1 },
            soldCount: {
              $sum: { $cond: [{ $ne: ["$soldTo", null] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const revenueMap = new Map();
    for (const r of revenueAgg) {
      revenueMap.set(r._id.toString(), r.revenue);
    }

    const productMap = new Map();
    for (const p of productCountAgg) {
      productMap.set(p._id.toString(), {
        productCount: p.productCount,
        soldCount: p.soldCount,
      });
    }

    const enrichedUsers = allUsers.map((user) => {
      const uid = user._id.toString();
      const prodStats = productMap.get(uid) || { productCount: 0, soldCount: 0 };
      return {
        ...user,
        revenue: revenueMap.get(uid) || 0,
        productCount: prodStats.productCount,
        soldCount: prodStats.soldCount,
      };
    });

    return { success: true, users: enrichedUsers };
  } catch (error) {
    console.error("Error in getUsersWithRevenue DAO:", error);
    return { success: false, message: "Database error while fetching users with revenue", users: [] };
  }
};
