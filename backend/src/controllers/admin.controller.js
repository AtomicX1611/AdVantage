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
    const adminId = req.user && req.user._id;
    const sellerId = req.params.sellerId || req.body.sellerId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated"
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller id required"
      });
    }
    console.log("admin id : ",adminId);
    console.log("selelr id : ",sellerId);
    
    
    const result = await removeSeller(sellerId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error) {
    console.error("Error in takeDownSeller controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
