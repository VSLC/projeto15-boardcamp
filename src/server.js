import express from "express";
import joi from "joi";
import cors from "cors";
import dayjs from "dayjs";
import sqlstring from "sqlstring";
import connection from "./db.js";

import categoriesRouters from "./routes/categoriesRouters.js";
import customersRouters from "./routes/customersRouters.js";
import { getGames, postGames } from "./controllers/gamesController.js";
import {
  getCustomerId,
  getCustomer,
  postCustomer,
  putCustomer,
} from "./controllers/customersController.js";
import {
  postRentals,
  getRentals,
  deleteRentalsId,
  finishRentals,
} from "./controllers/rentalsController.js";
const PORT = 4000;
const server = express();
server.use(express.json({ extended: true }));
server.use(cors());

//Categories routers
server.use(categoriesRouters);
//customers routers
server.use(customersRouters);

server.get("/games", getGames);

server.post("/games", postGames);

server.post("/rentals", postRentals);

server.delete("/rentals/:id", deleteRentalsId);

server.post("/rentals/:id/return", finishRentals);

server.get("/rentals", getRentals);

server.listen(PORT, () => {
  console.log("Listen on port 4000");
});
