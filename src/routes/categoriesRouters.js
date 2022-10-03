import express from "express";
import {
  getCategories,
  postCategories,
} from "../controllers/categoriesController.js";

const router = express.Router();
router.get("/categories", getCategories);
router.post("/categories", postCategories);

export default router;
