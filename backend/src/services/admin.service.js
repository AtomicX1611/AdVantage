import {
  getBuyers,
  getProducts,
  // getSellers,
  removeUserById,
  getAllAdmins,
  countAdmins,
} from "../daos/admins.dao.js";
import { getAllManagers, countManagers, removeManagerById, getManagerVerifiedCounts } from "../daos/managers.dao.js";
import { getAllUsers, countUsers } from "../daos/users.dao.js";
import { getAllProducts, countAllProducts } from "../daos/products.dao.js";
import { getAllPayments, countPayments } from "../daos/payment.dao.js";
// import { getAllContacts, countContacts } from "../daos/contacts.dao.js";
// import { getAllMessages, countMessages } from "../daos/messages.dao.js";

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
      message: "User and associated products removed successfully",
      user: result.user
    };

  } catch (error) {
    console.error("Error in removeUser service:", error);
    return { success: false, message: "Error removing user" };
  }
};

export const removeManager = async (managerId) => {
  try {
    if (!managerId) {
      return { success: false, message: "managerId is required" };
    }

    const result = await removeManagerById(managerId);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      message: "Manager removed successfully",
      manager: result.manager
    };

  } catch (error) {
    console.error("Error in removeManager service:", error);
    return { success: false, message: "Error removing manager" };
  }
};

export const getAllDataService = async () => {
  try {
    const [
      admins,
      managers,
      managerVerifiedCounts,
      users,
      products,
      payments,
      // contacts,
      // messages,
      adminCount,
      managerCount,
      userCount,
      productCount,
      paymentCount,
      // contactCount,
      // messageCount
    ] = await Promise.all([
      getAllAdmins(),
      getAllManagers(),
      getManagerVerifiedCounts(),
      getAllUsers(),
      getAllProducts(),
      getAllPayments(),
      // getAllContacts(),
      // getAllMessages(),
      countAdmins(),
      countManagers(),
      countUsers(),
      countAllProducts(),
      countPayments(),
      // countContacts(),
      // countMessages()
    ]);
    
    return {
      success: true,
      data: {
        admins,
        managers: managers.map(m => ({
          ...m,
          productsVerified: managerVerifiedCounts[m._id.toString()] || 0,
          createdAt: m._id.getTimestamp ? m._id.getTimestamp() : new Date(parseInt(m._id.toString().substring(0, 8), 16) * 1000),
        })),
        users,
        products,
        payments,
        // contacts,
        // messages
      },
      counts: {
        admins: adminCount,
        managers: managerCount,
        users: userCount,
        products: productCount,
        payments: paymentCount,
        // contacts: contactCount,
        // messages: messageCount,
        total: adminCount + managerCount + userCount + productCount + paymentCount
      }
    };

  } catch (error) {
    console.error("Error in getAllDataService:", error);
    return { 
      success: false, 
      message: "Error fetching all data from database",
      error: error.message 
    };
  }
};
