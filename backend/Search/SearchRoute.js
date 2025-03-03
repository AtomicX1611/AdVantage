import express from "express";
import {findProductsCont} from "./SearchController.js";
const searchRouter=express.Router();
searchRouter.post("/",findProductsCont);
export default searchRouter;