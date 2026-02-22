const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // kiểm tra dữ liệu đầu vào
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  // kiểm tra username đã tồn tại chưa
  // isValid trả về true nếu username CHƯA tồn tại → đảo điều kiện
  if (!isValid(username)) {
    return res.status(409).send("Username already exists");
  }

  // thêm user mới
  users.push({ username: username, password: password });
  return res.status(200).send("User registered successfully");
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn; // lấy ISBN từ URL
  const book = books[isbn]; // giả sử books là object chứa dữ liệu sách
  if (book) {
    res.json(book); // trả về thông tin sách
  } else {
    res.status(404).send("Book not found");
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author; // lấy tên tác giả từ URL
  let booksByAuthor = [];

  // duyệt qua tất cả các sách trong object books
  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor.push(books[isbn]);
    }
  }

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor); // trả về danh sách sách của tác giả
  } else {
    res.status(404).send("No books found for this author");
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title; // lấy tên tác giả từ URL
  let booksByTitle = [];

  // duyệt qua tất cả các sách trong object books
  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle.push(books[isbn]);
    }
  }

  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).send("No books found for this title");
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // lấy ISBN từ URL
  const book = books[isbn]; // tìm sách theo ISBN

  if (book && book.reviews) {
    res.json(book.reviews); // trả về reviews của sách
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

// Task 10: Get all books using async/await with Axios
async function getAllBooksAsync() {
  try {
    const response = await axios.get("http://localhost:5000/");
    console.log("All books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error.message);
    throw error;
  }
}

// Task 11: Get book details by ISBN using Promises
function getBookByISBNPromise(isbn) {
  return axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      console.log("Book details by ISBN:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching book by ISBN:", error.message);
      throw error;
    });
}

// Task 12: Get book details by Author using async/await with Axios
async function getBooksByAuthorAsync(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    console.log("Books by author:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
    throw error;
  }
}

// Task 13: Get book details by Title using async/await with Axios
async function getBooksByTitleAsync(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log("Books by title:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
    throw error;
  }
}

module.exports.general = public_users;

