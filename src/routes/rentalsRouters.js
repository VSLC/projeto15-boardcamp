import express from "express";
import {
  postRentals,
  getRentals,
  deleteRentalsId,
  finishRentals,
} from "../controllers/rentalsController.js";

const router = express.Router();

router.post("/rentals", postRentals);
router.delete("/rentals/:id", deleteRentalsId);
router.post("/rentals/:id/return", finishRentals);
router.get("/rentals", getRentals);

export default router;
