const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  if (!isValid(username)) {
    return res.status(409).send("Username already exists");
  }

  users.push({ username: username, password: password });
  return res.status(200).send("User registered successfully");
});

// Task 10: Get all books – Using async/await with Axios
public_users.get("/", async function (req, res) {
  try {
    const getAllBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const allBooks = await getAllBooks;
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN – Using Promises
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 12: Get book details based on Author – Using async/await
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const booksByAuthor = [];
      for (let isbn in books) {
        if (books[isbn].author === author) {
          booksByAuthor.push(books[isbn]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("No books found for this author"));
      }
    });
    const result = await getBooksByAuthor;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 13: Get book details based on Title – Using async/await
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const getBooksByTitle = new Promise((resolve, reject) => {
      const booksByTitle = [];
      for (let isbn in books) {
        if (books[isbn].title === title) {
          booksByTitle.push(books[isbn]);
        }
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found for this title"));
      }
    });
    const result = await getBooksByTitle;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.json(book.reviews);
  } else {
    res.status(404).send("No reviews found for this ISBN");
  }
});

// Add a book review (authenticated)
public_users.put("/review/:isbn", (req, res) => {
  if (!req.session || !req.session.authenticated) {
    return res.status(401).json({ message: "Please login first" });
  }
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  const username = req.session.authenticated.username;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  books[isbn].reviews[username] = review;
  res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review (authenticated)
public_users.delete("/review/:isbn", (req, res) => {
  if (!req.session || !req.session.authenticated) {
    return res.status(401).json({ message: "Please login first" });
  }
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  const username = req.session.authenticated.username;
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.status(200).json({ message: "Review deleted successfully" });
  } else {
    res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.general = public_users;


