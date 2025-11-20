const express = require("express");
const sql = require("mssql");
const app = express();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

app.get("/", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT * FROM Customers");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).send("DB ERROR");
  }
});

app.listen(3000, () => console.log("Running on port 3000"));
