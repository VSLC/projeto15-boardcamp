import express from "express";
import { getGames, postGames } from "../controllers/gamesController.js";
import { validateGames } from "../middlewares/gamesMiddlewares.js";
const router = express.Router();

router.get("/games", getGames);
router.post("/games", validateGames, postGames);

export default router;
