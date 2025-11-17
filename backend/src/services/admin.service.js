import {
  getBuyers,
  getProducts,
  // getSellers,
  removeUserById,
} from "../daos/admins.dao.js";

// export const findSellersForAdmin = async () => {
//   try {
//     const result = await getSellers();

//     if (!result.success) {
//       return result;
//     }

//     return {
//       success: true,
//       sellers: result.sellers
//     };

//   } catch (error) {
//     console.error("Error in findSellersForAdmin service:", error);
//     return { success: false, message: "Error fetching sellers from service", sellers: [] };
//   }
// };


export const findUsersForAdmin = async () => {
  try {
    const result = await getBuyers();

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      users: result.users
    };

  } catch (error) {
    console.error("Error in findUsersForAdmin service:", error);
    return { success: false, message: "Error fetching users from service", users: [] };
  }
};


export const getProductsForAdmin = async () => {
  return getProducts()
}

export const removeUser = async (userId) => {
  try {
    if (!userId) {
      return { success: false, message: "userId is required" };
    }

    const result = await removeUserById(userId);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      message: "Seller and associated products removed successfully",
      seller: result.seller
    };

  } catch (error) {
    console.error("Error in removeSeller service:", error);
    return { success: false, message: "Error removing seller" };
  }
};
