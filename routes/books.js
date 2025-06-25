const express = require("express");
const router = express.Router();

// Dummy book data
let books = [
  {
    id: 1,
    title: "Purple Hibiscus",
    author: "Chimamanda Ngozi Adichie",
    price: "₦2500",
  },
  {
    id: 2,
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    price: "₦2000",
  },
];

// GET all books
router.get("/", (req, res) => {
  res.json(books);
});

// POST a new book
router.post("/", (req, res) => {
  const { title, author, price } = req.body;
  const newBook = { id: books.length + 1, title, author, price };
  books.push(newBook);
  res.status(201).json(newBook);
});

module.exports = router;
