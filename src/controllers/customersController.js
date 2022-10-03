import connection from "../db.js";
import joi from "joi";

const getCustomerId = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(500).send(e);
  }
};

const getCustomer = async (req, res) => {
  try {
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
  } catch (e) {
    res.send(e).status(500);
  }
};

const postCustomer = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(500).send(e);
  }
};

const putCustomer = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(500).send(e);
  }
};
export { getCustomerId, getCustomer, postCustomer, putCustomer };
