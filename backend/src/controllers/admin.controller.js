import { findSellersForAdmin, findUsersForAdmin, getProductsForAdmin, removeSeller } from "../services/admin.service.js";


export const getGraphData = async () => {
    try {
      const result = await getProductsForAdmin()
      const graphData = result.map((item, index) => ({
        x: index,
        y: item.productCount
      }));
  
      return graphData;
    } catch (err) {
        return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
    }
  };
  
export const getUsersData = async (req, res) => {
  try {
    const sellersResult = await findSellersForAdmin();
    const usersResult = await findUsersForAdmin(); 

    if (!sellersResult.success || !usersResult.success) {
      return res.status(404).json({
        success: false,
        message: "Could not fetch complete data",
        sellers: sellersResult.sellers || [],
        users: usersResult.users || []
      });
    }

    return res.status(200).json({
      success: true,
      sellers: sellersResult.sellers,
      users: usersResult.users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const takeDownSeller = async (req, res) => {
  try {
    const { userId } = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const result = await removeSeller(userId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error) {
    console.error("Error in takeDownSeller controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
