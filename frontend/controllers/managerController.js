

export const managerLogin = async (req,res) => {
    try {
        const {email,password} = req.body

      const response = await fetch("http://localhost:3000/auth/manager/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({ email, password }),
      credentials : 'include'
    });

    const data = await response.json();   
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    console.log('Manager login in backend success,cookie : ',setCookie);
    
    res.status(response.status).json(data);

    } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (adminLogin)",
    })
    }
}

export const verifyProduct = async (req, res) => {
  const productId = req.body.pid;

  try {
    const verify = await fetch("http://localhost:3000/manager/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pid: productId }),
    });

    const data = await verify.json();

    if (data.success) {
      return res.redirect("/manager/dashboard");
    } else {
      return res.status(404).json({ message: data.message });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const getuUnVerifiedProducts = async (req,res) => {
  try {
    console.log('getting manager dashboard data');
    
     const response = await fetch("http://localhost:3000/manager/d", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         cookie: req.headers.cookie || "",
      },
      credentials : 'include'
    });
    
     const data = await response.json()
      console.log('got data ',data);
     const {products} = data
     res.render("ManagerDashboard", { products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong in frontend proxy (getUnVerifiedProducts)",
    });
  }
}