export const getUsersData = async (req, res) => {
  try {
    console.log("Logging after fetch");

    const response = await fetch("http://localhost:3000/admin/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(data);
    res.status(response.status).json(data);
    const { sellers, users } = data;
    console.log(sellers, users);
    res.render("Admin.ejs", { sellers: sellers, users: users });
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
    const response = await fetch("http://localhost:3000/admin/grahpData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  } catch (error) {}
};
