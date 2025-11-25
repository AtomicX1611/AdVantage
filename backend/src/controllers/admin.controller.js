import {
  findUsersForAdmin,
  getProductsForAdmin,
  removeUser,
} from "../services/admin.service.js";


export const getGraphData = async (req,res) => {
  try {
    const result = await getProductsForAdmin()
    const graphData = result.map((item, index) => ({
      x: index,
      y: item.productCount
    }));

    return res.status(200).json({
      success: true,
      graphData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};

export const getUsersData = async (req, res) => {
  try {
    const usersResult = await findUsersForAdmin();

    if (!usersResult.success) {
      return res.status(404).json({
        success: false,
        message: "Could not fetch complete data",
        users: [],
      });
    }

    return res.status(200).json({
      success: true,
      users: usersResult.users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const takeDownUser = async (req, res) => {
  try {
    const adminId = req.user && req.user._id;
    const userId = req.params.userId || req.body.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated"
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id required"
      });
    }
    console.log("admin id : ", adminId);
    console.log("user id : ", userId);


    const result = await removeUser(userId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error) {
    console.error("Error in takeDownUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
