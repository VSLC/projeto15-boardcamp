import connection from "../db.js";
import joi from "joi";

const verifyName = async (req, res, next) => {
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
  res.locals.name = name;
  next();
};

export { verifyName };
