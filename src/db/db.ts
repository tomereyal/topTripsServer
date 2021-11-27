import mysql2 from "mysql2/promise";

export const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) | 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "mrtom45",
  database: "trips",
});
