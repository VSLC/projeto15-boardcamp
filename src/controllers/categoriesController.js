import connection from "../db.js";
import joi from "joi";

const getCategories = async (req, res) => {
  try {
    const categories = await connection.query("SELECT * FROM categories");
    res.send(categories.rows);
  } catch (e) {
    res.sendStatus(500);
  }
};

const postCategories = async (req, res) => {
  try {
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
  } catch (e) {
    res.sendStatus(500);
  }
};

export { getCategories, postCategories };
