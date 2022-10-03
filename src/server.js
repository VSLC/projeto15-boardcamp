import express from "express";
import cors from "cors";

import categoriesRouters from "./routes/categoriesRouters.js";
import customersRouters from "./routes/customersRouters.js";
import gamesRouters from "./routes/gamesRouters.js";
import rentalsRouters from "./routes/rentalsRouters.js";

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
// games routers
server.use(gamesRouters);
// rentals routers
server.use(rentalsRouters);

server.listen(PORT, () => {
  console.log("Listen on port 4000");
});
