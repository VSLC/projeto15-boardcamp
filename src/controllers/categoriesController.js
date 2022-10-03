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
    const nameLocals = res.locals.name;
    console.log(nameLocals);

    const insertCategories = await connection.query(
      "INSERT INTO categories (name) VALUES ($1)",
      [nameLocals]
    );
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
};

export { getCategories, postCategories };
