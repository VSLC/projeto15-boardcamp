import pkg from "pg";

const { Pool } = pkg;
const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: "postgres",
  password: "34525954",
  host: "localhost",
  port: 5432,
  database: "boardcamp",
});

export default connection;
