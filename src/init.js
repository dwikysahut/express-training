// init.js

const sql = require("mssql");
const fs = require("fs");
const path = require("path");

// Konfigurasi koneksi dari environment variables
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  // Kita tidak perlu menentukan database di sini, karena kita membuat database di init.sql
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Set timeout yang lebih lama untuk inisialisasi
    requestTimeout: 60000,
  },
};

/**
 * Fungsi untuk menunggu SQL Server siap dan menjalankan inisialisasi.
 */
async function initializeDatabase() {
  // File init.sql berada di folder root project (../sql/init.sql), bukan di dalam src/
  const initScriptPath = path.join(__dirname, "..", "sql", "init.sql");
  if (!fs.existsSync(initScriptPath)) {
    throw new Error(`[INIT] File init.sql tidak ditemukan pada path: ${initScriptPath}`);
  }
  const rawScript = fs.readFileSync(initScriptPath, "utf8");

  // Pecah script menjadi batch berdasarkan baris yang hanya berisi 'GO'
  const batches = rawScript
    .split(/^\s*GO\s*$/gim)
    .map((s) => s.trim())
    .filter((s) => s.length);

  let pool;
  let retryCount = 0;
  const maxRetries = 15;
  const retryInterval = 5000; // 5 detik

  // 1. Loop Tunggu (Wait Loop)
  while (retryCount < maxRetries) {
    try {
      console.log(`[INIT] Mencoba koneksi ke SQL Server (${retryCount + 1}/${maxRetries})...`);

      // Coba koneksi ke server, bukan ke database tertentu
      pool = await sql.connect({
        ...config,
        // Hapus database: process.env.DB_NAME agar bisa terhubung ke master
        database: "master",
      });

      console.log("[INIT] Koneksi ke SQL Server berhasil.");
      break;
    } catch (err) {
      if (retryCount === maxRetries - 1) {
        console.error("[INIT] GAGAL: Batas percobaan koneksi terlampaui.");
        throw err;
      }
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }

  // 2. Inisialisasi manual (tanpa parser GO) agar lebih deterministik
  if (pool) {
    try {
      console.log(`[INIT] Menjalankan inisialisasi manual tanpa parser GO...`);
      const request = new sql.Request(pool);
      // 1. Buat database jika belum ada
      await request.query("IF DB_ID('DemoDB') IS NULL CREATE DATABASE DemoDB;");
      // 2. Buat tabel jika belum ada (gunakan context DemoDB)
      await request.query(
        "USE DemoDB; IF OBJECT_ID('dbo.Customers','U') IS NULL BEGIN CREATE TABLE dbo.Customers (CustomerID INT IDENTITY(1,1) PRIMARY KEY, Name NVARCHAR(50), Email NVARCHAR(50)); END"
      );
      // 3. Seed data jika tabel kosong
      await request.query(
        "USE DemoDB; IF NOT EXISTS (SELECT 1 FROM dbo.Customers) BEGIN INSERT INTO dbo.Customers (Name, Email) VALUES ('Alice','alice@example.com'),('Bob','bob@example.com'); END"
      );
      console.log("[INIT] Inisialisasi database selesai.");
    } finally {
      if (pool) pool.close();
    }
  }
}

module.exports = initializeDatabase;
