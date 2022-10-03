import connection from "../db.js";
import dayjs from "dayjs";

const postRentals = async (req, res) => {
  try {
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

    const gamesQuery = await connection.query(
      "SELECT * FROM games WHERE id=$1",
      [gameId]
    );

    console.log(gamesQuery.rows[0]);

    const pricePerDay = gamesQuery.rows[0].pricePerDay;
    console.log(pricePerDay);
    const originalPrice = pricePerDay * daysRented;
    const rentDate = dayjs().format("YYYY-MM-DD");

    const insertRentals = await connection.query(
      'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7 )',
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );

    res.sendStatus(201);
  } catch (e) {
    res.status(500).send(e);
  }
};

const getRentals = async (req, res) => {
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
};

const deleteRentalsId = async (req, res) => {
  try {
    const { id } = req.params;
    const idQuery = await connection.query(
      "SELECT id FROM rentals WHERE id=$1;",
      [id]
    );
    if (idQuery.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const returnDateQuery = await connection.query(
      `SELECT id,"returnDate" FROM rentals WHERE id=$1`,
      [id]
    );

    const hasReturnDate = returnDateQuery.rows[0]?.returnDate;
    console.log(hasReturnDate, "return Date");

    if (hasReturnDate === null) {
      res.sendStatus(400);
      return;
    }

    const deleteQuery = await connection.query(
      "DELETE FROM rentals WHERE id=$1",
      [id]
    );

    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e);
  }
};

const finishRentals = async (req, res) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    const rentalsIdQuery = await connection.query("SELECT * FROM rentals");
    const rentalsIdArray = rentalsIdQuery.rows.map((e) => e.id);
    const isRentalIdValid = rentalsIdArray.includes(id);
    console.log(isRentalIdValid, "rentalidValid");

    if (!isRentalIdValid) {
      res.sendStatus(404);
      return;
    }

    const rentalsFinalizedQuery = await connection.query(
      "SELECT * from rentals WHERE id=$1",
      [id]
    );
    const hasRentalsReturnDate = rentalsFinalizedQuery.rows[0].returnDate;
    if (hasRentalsReturnDate !== null) {
      res.sendStatus(400);
      return;
    }

    const returnDate = dayjs().format("YYYY-MM-DD");
    console.log(returnDate);
    try {
      const rentalsReturnQuery = await connection.query(
        `SELECT rentals.*,games."pricePerDay" FROM rentals JOIN games ON games.id=rentals."gameId" WHERE rentals.id=$1;
    `,
        [id]
      );
      const rent = rentalsReturnQuery.rows[0];
      const daysDiff = dayjs().diff(rent.rentDate, "day");
      const delayFee = daysDiff * rent.pricePerDay;

      const updateRentQuery = await connection.query(
        `
    UPDATE rentals SET "returnDate"=$1,"delayFee"=$2 WHERE id=$3;
    `,
        [returnDate, delayFee, id]
      );

      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

export { postRentals, getRentals, deleteRentalsId, finishRentals };
