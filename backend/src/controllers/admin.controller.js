import {
  findUsersForAdmin,
  getProductsForAdmin,
  removeUser,
  removeManager,
  addManagerService,
  getAllDataService,
  getAdminMetricsService,
  getPaymentAnalyticsService,
} from "../services/admin.service.js";


export const getGraphData = async (req,res,next) => {
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
    next(err);
  }
};

export const getAllData = async (req, res, next) => {
  try {
    const result = await getAllDataService();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to fetch all data",
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: "All data fetched successfully",
      data: result.data,
      counts: result.counts
    });

  } catch (error) {
    console.error("Error in getAllData controller:", error);
    next(error);
  }
};



export const takeDownUser = async (req, res, next) => {
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
    next(error);
  }
};

export const takeDownManager = async (req, res, next) => {
  try {
    const adminId = req.user && req.user._id;
    const managerId = req.params.managerId || req.body.managerId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated"
      });
    }

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "Manager id required"
      });
    }

    const result = await removeManager(managerId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error) {
    console.error("Error in takeDownManager controller:", error);
    next(error);
  }
};

export const getMetrics = async (req, res, next) => {
  try {
    const result = await getAdminMetricsService();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to fetch metrics"
      });
    }

    return res.status(200).json({
      success: true,
      metrics: result.metrics
    });
  } catch (error) {
    console.error("Error in getMetrics controller:", error);
    next(error);
  }
};

export const getPaymentAnalytics = async (req, res, next) => {
  try {
    const result = await getPaymentAnalyticsService();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to fetch payment analytics"
      });
    }

    return res.status(200).json({
      success: true,
      analytics: result.analytics
    });
  } catch (error) {
    console.error("Error in getPaymentAnalytics controller:", error);
    next(error);
  }
};

export const addNewManager = async (req, res, next) => {
  try {
    const adminId = req.user?._id;
    const { email, password } = req.body;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated"
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await addManagerService(email, password);
    return res.status(result.success ? 201 : 400).json(result);

  } catch (error) {
    console.error("Error in addNewManager controller:", error);
    next(error);
  }
};
