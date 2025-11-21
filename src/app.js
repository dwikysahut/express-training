const express = require("express");
const sql = require("mssql");
const client = require("prom-client");

const app = express();

// Metrics registry
const register = new client.Registry();

client.collectDefaultMetrics({ register });

// Custom metric (optional)
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
});
register.registerMetric(httpRequestCounter);

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

// Endpoint utama
app.get("/", async (req, res) => {
  httpRequestCounter.inc();

  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT * FROM Customers");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).send("DB ERROR");
  }
});

// Endpoint Prometheus metrics
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log("Running on port 3000"));
