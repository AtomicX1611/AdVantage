export const getUsersData = async (req, res) => {

     try {
    const response = await fetch(`${process.env.BACKEND_URL}admin/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         cookie: req.headers.cookie || "",
      },
      credentials : 'include'
    });
     
    const data = await response.json();
    const { sellers, users } = data;
    res.render("Admin.ejs", { sellers: sellers, users: users,backendURL: process.env.BACKEND_URL });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong in frontend proxy (getUsersData)",
    });
  }
};

export const getGraphData = async (req, res) => {

  try {
    const response = await fetch(`${process.env.BACKEND_URL}admin/grahpData`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         cookie: req.headers.cookie || "",
      },
        credentials : 'include'
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong in frontend proxy (getUsersData)",
    });
  }
};

export const removeSeller = async (req, res) => {
   try {
    const { id } = req.params;
   
    
    const response = await fetch(`${process.env.BACKEND_URL}admin/remove/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
          cookie: req.headers.cookie || "",
      },
       credentials: "include",
    });
  
     
    const data = await response.json();
     console.log("Data : ",data);
     
    if (data.success) {
      return res.redirect('/admin');  
    } else {
      return res.status(400).json({ message: data.message });
    }
  } catch (error) {
    console.error("Error in frontend removeSeller:", error);
    return res.status(500).json( { message: "Internal Server Error" });
  }
};
