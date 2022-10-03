import connection from "../db.js";

const validateRentals = async (req, res, next) => {
  const { customerId, gameId, daysRented } = req.body;

  const idsCustomers = await connection.query("SELECT id FROM customers");
  const customerIdArray = idsCustomers.rows.map((e) => e.id);
  const isCustomerIdValid = customerIdArray.includes(customerId);
  console.log(isCustomerIdValid);
  if (!isCustomerIdValid) {
    res.sendStatus(400);
    return;
  }

  const idsGames = await connection.query("SELECT id FROM games");
  const gamesIdArray = idsGames.rows.map((e) => e.id);
  const isGameIdValid = gamesIdArray.includes(customerId);
  if (!isGameIdValid) {
    res.sendStatus(400);
    return;
  }

  if (daysRented <= 0) {
    res.sendStatus(400);
    return;
  }

  next();
};

export { validateRentals };
