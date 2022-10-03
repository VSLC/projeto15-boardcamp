import express from "express";
import {
  getCustomerId,
  getCustomer,
  postCustomer,
  putCustomer,
} from "../controllers/customersController.js";

const router = express.Router();

router.get("/customers/:id", getCustomerId);
router.get("/customers", getCustomer);
router.post("/customers", postCustomer);
router.put("/customers/:id", putCustomer);

export default router;
