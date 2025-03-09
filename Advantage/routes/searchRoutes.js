import express from "express";

import {findProductsCont} from "../controllers/searchController.js";

const searchRouter=express.Router();

searchRouter.post("/",findProductsCont);

export default searchRouter;