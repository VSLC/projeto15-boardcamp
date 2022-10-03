import express from "express";
import {
  getCategories,
  postCategories,
} from "../controllers/categoriesController.js";
import { verifyName } from "../middlewares/categoriesMiddlewares.js";
const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", verifyName, postCategories);

export default router;
