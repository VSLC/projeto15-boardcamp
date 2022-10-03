import express from "express";
import {
  getCustomerId,
  getCustomer,
  postCustomer,
  putCustomer,
} from "../controllers/customersController.js";
import { validateCustomer } from "../middlewares/customersMiddlewares.js";
const router = express.Router();

router.get("/customers/:id", getCustomerId);
router.get("/customers", getCustomer);
router.post("/customers", validateCustomer, postCustomer);
router.put("/customers/:id", validateCustomer, putCustomer);

export default router;
