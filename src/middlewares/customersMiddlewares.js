import joi from "joi";
import connection from "../db.js";

const validateCustomer = async (req, res, next) => {
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

  res.locals.name = name;
  res.locals.phone = phone;
  res.locals.cpf = cpf;
  res.locals.birthday = birthday;

  next();
};

export { validateCustomer };
