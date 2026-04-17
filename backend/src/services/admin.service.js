import {
  getBuyers,
  getProducts,
  // getSellers,
  removeUserById,
  getAllAdmins,
  countAdmins,
} from "../daos/admins.dao.js";
import { getAllManagers, countManagers, removeManagerById, getManagerVerifiedCounts, createManager,findManagerByEmail } from "../daos/managers.dao.js";
import { getAllUsers, countUsers, countActiveUsers } from "../daos/users.dao.js";
import { getAllProducts, countAllProducts, getProductsByCategory, countVerifiedProducts, countUnverifiedProducts } from "../daos/products.dao.js";
import { 
  getAllPayments, 
  countPayments, 
  getPaymentStatsByType, 
  getRecentPayments,
  getRevenueByCategory,
  getRevenueByState,
  getRevenueByPaymentType,
  getMonthlyRevenue,
  getPaymentsWithProductDetails,
  getTopCategories,
  getTopStates,
  getRentalVsPurchaseStats
} from "../daos/payment.dao.js";
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

export const addManagerService = async (email, password, category) => {
  try {
    if (!email || !password || !category) {
      return { success: false, message: "Email, password, and category are required" };
    }

    const existing = await findManagerByEmail(email);
    if (existing) {
      return { success: false, message: "Manager with this email already exists" };
    }

    const manager = await createManager({ email, password, category });
    return {
      success: true,
      message: "Manager added successfully",
      manager: { _id: manager._id, email: manager.email, category: manager.category }
    };
  } catch (error) {
    console.error("Error in addManagerService:", error);
    return { success: false, message: "Error adding manager" };
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

// export const addManagerService = async (email, password) => {
//   try {
//     if (!email || !password) {
//       return { success: false, message: "Email and password are required" };
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return { success: false, message: "Invalid email format" };
//     }

//     // Validate password length
//     if (password.length < 6) {
//       return { success: false, message: "Password must be at least 6 characters" };
//     }

//     const result = await createManager(email, password);

//     if (!result.success) {
//       return result;
//     }

//     // Return manager without password
//     const managerData = result.manager.toObject();
//     delete managerData.password;

//     return {
//       success: true,
//       message: "Manager created successfully",
//       manager: managerData
//     };

//   } catch (error) {
//     console.error("Error in addManagerService:", error);
//     return { success: false, message: "Error creating manager" };
//   }
// };

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
export const getAdminMetricsService = async () => {
  try {
    const [
      categoryDistribution,
      revenueByType,
      recentPaymentsList,
      activeUserCount,
      totalUserCount,
      verifiedProductCount,
      unverifiedProductCount,
      totalProductCount,
      totalPaymentCount,
    ] = await Promise.all([
      getProductsByCategory(),
      getPaymentStatsByType(),
      getRecentPayments(10),
      countActiveUsers(),
      countUsers(),
      countVerifiedProducts(),
      countUnverifiedProducts(),
      countAllProducts(),
      countPayments(),
    ]);

    const totalRevenue = revenueByType.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    return {
      success: true,
      metrics: {
        categoryDistribution,
        revenueByType,
        recentActivity: recentPaymentsList.map(p => ({
          _id: p._id,
          from: p.from?.username || p.from?.email || 'Unknown',
          to: p.to?.username || p.to?.email || 'Unknown',
          type: p.paymentType,
          amount: p.price,
          date: p.date,
        })),
        activeUsers: activeUserCount,
        totalUsers: totalUserCount,
        verifiedProducts: verifiedProductCount,
        unverifiedProducts: unverifiedProductCount,
        totalProducts: totalProductCount,
        totalPayments: totalPaymentCount,
        totalRevenue,
      }
    };
  } catch (error) {
    console.error("Error in getAdminMetricsService:", error);
    return { success: false, message: "Error computing admin metrics" };
  }
};

// Payment Analytics Service
export const getPaymentAnalyticsService = async () => {
  try {
    const [
      revenueByCategory,
      revenueByState,
      revenueByPaymentType,
      monthlyRevenue,
      paymentsWithDetails,
      topCategories,
      topStates,
      rentalVsPurchase
    ] = await Promise.all([
      getRevenueByCategory(),
      getRevenueByState(),
      getRevenueByPaymentType(),
      getMonthlyRevenue(12),
      getPaymentsWithProductDetails(100),
      getTopCategories(10),
      getTopStates(10),
      getRentalVsPurchaseStats()
    ]);

    // Transform rental vs purchase data
    const rentalStats = rentalVsPurchase.find(r => r._id === true) || { count: 0, totalRevenue: 0 };
    const purchaseStats = rentalVsPurchase.find(r => r._id === false) || { count: 0, totalRevenue: 0 };

    // Transform monthly revenue for chart
    const monthlyRevenueFormatted = monthlyRevenue.map(m => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      revenue: m.totalRevenue,
      count: m.count
    }));

    return {
      success: true,
      analytics: {
        revenueByCategory: revenueByCategory.map(c => ({
          category: c._id || 'Uncategorized',
          revenue: c.totalRevenue,
          count: c.count
        })),
        revenueByState: revenueByState.map(s => ({
          state: s._id || 'Unknown',
          revenue: s.totalRevenue,
          count: s.count
        })),
        revenueByPaymentType: revenueByPaymentType.map(p => ({
          type: p._id,
          revenue: p.totalRevenue,
          count: p.count
        })),
        monthlyRevenue: monthlyRevenueFormatted,
        topCategories: topCategories.map(c => ({
          category: c._id,
          salesCount: c.salesCount,
          revenue: c.totalRevenue,
          avgPrice: Math.round(c.avgPrice)
        })),
        topStates: topStates.map(s => ({
          state: s._id,
          salesCount: s.salesCount,
          revenue: s.totalRevenue
        })),
        rentalVsPurchase: {
          rental: { count: rentalStats.count, revenue: rentalStats.totalRevenue },
          purchase: { count: purchaseStats.count, revenue: purchaseStats.totalRevenue }
        },
        detailedPayments: paymentsWithDetails.map(p => ({
          _id: p._id,
          from: p.fromUser || p.fromEmail || 'Unknown',
          to: p.toUser || p.toEmail || 'Unknown',
          amount: p.price,
          type: p.paymentType,
          date: p.date,
          product: p.productName || null,
          category: p.productCategory || null,
          state: p.productState || null,
          city: p.productCity || null,
          district: p.productDistrict || null,
          isRental: p.isRental || false
        }))
      }
    };
  } catch (error) {
    console.error("Error in getPaymentAnalyticsService:", error);
    return { success: false, message: "Error computing payment analytics" };
  }
};