const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bookRoutes = require("./routes/books");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // parse JSON in requests

app.use("/api/books", bookRoutes); // route prefix

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
