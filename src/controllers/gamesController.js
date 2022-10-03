import connection from "../db.js";
import joi from "joi";

const getGames = async (req, res) => {
  try {
    const nameQuery = req.query.name;

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
  } catch (e) {
    res.status(500).send(e);
  }
};

const postGames = async (req, res) => {
  try {
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
      [
        res.locals.name,
        res.locals.image,
        res.locals.stockTotal,
        res.locals.categoryId,
        res.locals.pricePerDay,
      ]
    );
    res.sendStatus(201);
  } catch (e) {
    res.status(500).send(e);
  }
};

export { getGames, postGames };
