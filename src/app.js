// server.js (atau index.js)

const express = require("express");
const sql = require("mssql");
const client = require("prom-client");
const initializeDatabase = require("./init"); // <-- Import skrip inisialisasi

const app = express();

// ... (Kode Metrics/Prometheus lainnya sama seperti sebelumnya) ...

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
});
register.registerMetric(httpRequestCounter);

// Konfigurasi koneksi
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME, // Sekarang kita akan terhubung ke DemoDB
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

// Fungsi utama untuk menjalankan aplikasi setelah inisialisasi
async function startApp() {
  console.log("Memulai Inisialisasi Database...");
  await initializeDatabase(); // <-- Panggil fungsi inisialisasi

  app.listen(3000, () => console.log("Express App Running on port 3000"));
}

startApp().catch((err) => {
  console.error("Aplikasi gagal dijalankan:", err);
  process.exit(1);
});
