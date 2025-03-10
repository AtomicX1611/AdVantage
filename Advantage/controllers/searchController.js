import { findProducts } from "../models/User.js";

export const findProductsCont = async function (req, res) {
  console.log(req.body);
  let returningProducts = await findProducts(req.body.name, req.body.location);
  console.log(returningProducts);
  res.json(returningProducts);
};
