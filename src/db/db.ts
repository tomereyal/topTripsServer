import mysql2 from "mysql2/promise";

export const db = mysql2.createPool({
  host: "us-cdbr-east-04.cleardb.com",
  port: Number(process.env.DB_PORT) | 3306,
  user: "bb6b2620f61978",
  password: "6e32c86b",
  database: "heroku_98a56fc31c47ffd",
});

//FOR LOCAL DEVELOPMENT
// export const db = mysql2.createPool({
//   host: process.env.DB_HOST|| "localhost",
//   port: Number(process.env.DB_PORT) | 3306,
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASS || "mrtom45",
//   database: "trips",
// });

//mysql://bb6b2620f61978:6e32c86b@us-cdbr-east-04.cleardb.com/heroku_98a56fc31c47ffd?reconnect=true
