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
    const insertCustomer = await connection.query(
      "INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1 , $2 ,$3 ,$4)",
      [res.locals.name, res.locals.phone, res.locals.cpf, res.locals.birthday]
    );
    res.sendStatus(201);
  } catch (e) {
    res.status(500).send(e);
  }
};

const putCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updateCustomer = await connection.query(
      `UPDATE customers SET name=($1), phone=($2) , cpf=($3), birthday=($4) WHERE id=${id} `,
      [res.locals.name, res.locals.phone, res.locals.cpf, res.locals.birthday]
    );
    res.sendStatus(201);
  } catch (e) {
    res.status(500).send(e);
  }
};
export { getCustomerId, getCustomer, postCustomer, putCustomer };
