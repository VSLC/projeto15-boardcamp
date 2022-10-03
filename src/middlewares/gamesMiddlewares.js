import joi from "joi";
import connection from "../db.js";

const validateGames = async (req, res, next) => {
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
  try {
    const nameRepeated = await connection.query(
      "SELECT * FROM games WHERE name = $1",
      [name]
    );

    if (nameRepeated.rows.length !== 0) {
      res.sendStatus(409);
      return;
    }

    res.locals.name = name;
    res.locals.image = image;
    res.locals.stockTotal = stockTotal;
    res.locals.categoryId = categoryId;
    res.locals.pricePerDay = pricePerDay;
  } catch (e) {
    res.status(500).send(e);
  }
  next();
};

export { validateGames };
