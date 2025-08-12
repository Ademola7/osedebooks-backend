require("dotenv").config();
const mysql = require("mysql2");

// Create connection
const connection = mysql.createConnection({
  host: "osedebooks.com", // from One.com control panel
  user: "caixq00js_osedebooks",
  password: "apunu",
  database: "osedebooks",
});

// Connect to DB
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to One.com MySQL database");
});

module.exports = connection;
