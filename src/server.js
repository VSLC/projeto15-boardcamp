import express from "express";
import pkg from "pg";
import joi from "joi";
import cors from "cors";
import dayjs from "dayjs";
import sqlstring from "sqlstring";

const { Pool } = pkg;
const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: "postgres",
  password: "34525954",
  host: "localhost",
  port: 5432,
  database: "boardcamp",
});

const PORT = 4000;
const server = express();
server.use(express.json());
server.use(cors());

server.get("/categories", async (req, res) => {
  const categories = await connection.query("SELECT * FROM categories");
  res.send(categories.rows);
});

server.post("/categories", async (req, res) => {
  let { name } = req.body;
  name = name.toLowerCase();

  const categories = await connection.query("SELECT * FROM categories");
  const repeatedCategories = categories.rows.map((e) => e.name);
  const isCategorieRepeated = repeatedCategories.includes(name);
  if (isCategorieRepeated) {
    res.sendStatus(409);
    return;
  }
  const validationSchema = joi.object({
    name: joi.string().required(),
  });

  const validation = validationSchema.validate({ name });
  if (validation.error) {
    res.sendStatus(400);
    return;
  }

  const insertCategories = await connection.query(
    "INSERT INTO categories (name) VALUES ($1)",
    [name]
  );
  res.sendStatus(200);
});

server.get("/games", async (req, res) => {
  const nameQuery = req.query.name;
  console.log(nameQuery);
  if (nameQuery) {
    const getQueryGamesWithName = await connection.query(
      "SELECT * FROM games WHERE name LIKE ($1);",
      [`${nameQuery}%`]
    );
    res.status(200).send(getQueryGamesWithName.rows);
  } else {
    const gamesQueryWithoutName = await connection.query(
      'SELECT games.id,games."pricePerDay",games.image,games.name,categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id;'
    );
    res.status(200).send(gamesQueryWithoutName.rows);
  }
});

server.post("/games", async (req, res) => {
  let { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  name = name.toLowerCase();
  pricePerDay = 100 * pricePerDay;

  const gamesSchema = joi.object({
    name: joi.string().required(),
    stockTotal: joi.number().positive(),
    pricePerDay: joi.number().positive(),
  });

  const validation = gamesSchema.validate(
    { name, stockTotal, pricePerDay },
    { abortEarly: false }
  );
  if (validation.error) {
    res.status(400).send(validation.error.details[0].message);
    return;
  }

  const nameRepeated = await connection.query(
    "SELECT * FROM games WHERE name = $1",
    [name]
  );

  if (nameRepeated.rows.length !== 0) {
    res.sendStatus(409);
    return;
  }
  const insertGames = await connection.query(
    `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1, $2 ,$3, $4, $5) `,
    [name, image, stockTotal, categoryId, pricePerDay]
  );
  res.sendStatus(201);
});

server.get("/customers/:id", async (req, res) => {
  const idParams = parseInt(req.params.id);
  console.log(idParams);

  if (idParams) {
    const customerGetQuery = await connection.query(
      "SELECT * FROM customers WHERE id=$1",
      [idParams]
    );
    if (customerGetQuery.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.status(201).send(customerGetQuery.rows);
    }
  }
});

server.get("/customers", async (req, res) => {
  const cpf = req.query.cpf;

  if (cpf === undefined) {
    const customerGetQuery = await connection.query(
      "SELECT * FROM customers ORDER BY id"
    );
    res.status(201).send(customerGetQuery.rows);
  } else {
    const customerGetQuery = await connection.query(
      "SELECT * FROM customers WHERE cpf LIKE $1",
      [`${cpf}%`]
    );
    res.status(201).send(customerGetQuery.rows);
  }
});

server.post("/customers", async (req, res) => {
  let { name, phone, cpf, birthday } = req.body;
  name = name.toLowerCase();

  const isCpfRepeated = await connection.query(
    "SELECT * FROM customers WHERE cpf=$1",
    [cpf]
  );

  console.log(isCpfRepeated.rows);

  if (isCpfRepeated.rows.length !== 0) {
    res.sendStatus(409);
    return;
  }

  const customerSchema = joi.object({
    name: joi.string().required(),
    birthday: joi.date().required(),
    cpf: joi.string().required().length(11),
    phone: joi.string().required().min(10).max(11),
  });

  const validation = customerSchema.validate(
    { name, phone, cpf, birthday },
    { abortEarly: false }
  );

  if (validation.error) {
    res.status(400).send(validation.error.message);
    return;
  }
  const insertCustomer = await connection.query(
    "INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1 , $2 ,$3 ,$4)",
    [name, phone, cpf, birthday]
  );
  res.sendStatus(201);
});

server.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  const isCpfRepeated = await connection.query(
    "SELECT * FROM customers WHERE cpf=$1",
    [cpf]
  );

  console.log(isCpfRepeated.rows);

  if (isCpfRepeated.rows.length !== 0) {
    res.sendStatus(409);
    return;
  }

  const customerSchema = joi.object({
    name: joi.string().required(),
    birthday: joi.date().required(),
    cpf: joi.string().required().length(11),
    phone: joi.string().required().min(10).max(11),
  });

  const validation = customerSchema.validate(
    { name, phone, cpf, birthday },
    { abortEarly: false }
  );

  if (validation.error) {
    res.status(400).send(validation.error.message);
    return;
  }

  const updateCustomer = await connection.query(
    `UPDATE customers SET name=($1), phone=($2) , cpf=($3), birthday=($4) WHERE id=${id} `,
    [name, phone, cpf, birthday]
  );
  console.log(updateCustomer);
  res.sendStatus(201);
});

server.post("/rentals", async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;
  const gamesQuery = await connection.query("SELECT * FROM games WHERE id=$1", [
    gameId,
  ]);
  const pricePerDay = gamesQuery.rows[0].pricePerDay;
  const originalPrice = pricePerDay * daysRented;
  const rentDate = dayjs().format("YYYY-MM-DD");

  const insertRentals = await connection.query(
    'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7 )',
    [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
  );
  res.status(201).send(insertRentals);
});

server.delete("/rentals/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  const idQuery = await connection.query(
    "SELECT id FROM rentals WHERE id=$1;",
    [id]
  );
  if (idQuery.rows.length === 0) {
    res.sendStatus(404);
    return;
  }
  const deleteQuery = await connection.query(
    "DELETE FROM rentals WHERE id=$1",
    [id]
  );
  console.log();

  res.status(200).send("ok");
});

server.get("/rentals", async (req, res) => {
  const customerId = req.query.customerId;
  const gameId = req.query.gameId;

  let WHERE = "";

  if (customerId) {
    WHERE = `WHERE customers.id=${sqlstring.escape(customerId)}`;
  }

  if (gameId) {
    WHERE = `WHERE games.id=${sqlstring.escape(gameId)}`;
  }

  try {
    const rentalsQuery = await connection.query({
      text: `SELECT rentals.*,customers.name AS "customerName",customers.id,games.id,games.name AS "gameName", games."categoryId", categories.name AS "categoryName"  FROM rentals 
      JOIN customers ON customers.id = rentals."customerId" 
      JOIN games ON rentals."gameId" = games.id 
      JOIN categories ON games."categoryId"=categories.id
      ${WHERE};`,
      rowMode: "array",
    });

    const rentalsObject = rentalsQuery.rows.map((e) => {
      const [
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        nameCustomer,
        idCustomer,
        idGame,
        nameGame,
        categoryId,
        categoryName,
      ] = e;
      const objectRentals = {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer: { id: idCustomer, name: nameCustomer },
        game: {
          id: idGame,
          name: nameGame,
          categoryId: categoryId,
          categoryName: categoryName,
        },
      };
      return objectRentals;
    });
    console.log(rentalsObject);
    res.send(rentalsObject).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});
server.listen(PORT, () => {
  console.log("Listen on port 4000");
});
