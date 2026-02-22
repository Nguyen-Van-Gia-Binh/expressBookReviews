const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
// {username : "", password: "" }
const isValid = (username) => {
  return !users.some((user) => user.username === username);
  // trả về TRUE nếu username CHƯA tồn tại
};


const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  // In users
  const username = req.body.username;
  const password = req.body.password;

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ data: username }, "access", {
      expiresIn: 60 * 60,
    });

    req.session.authenticated = {
      token,
      username,
    };
    res.send("Ok");
  } else {
    res.status(404).send("Invalid username or password");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }
  const username = req.session.authenticated.username;
  const review = req.body.review;
  books[isbn].reviews[username] = review;
  res.send("Review added/updated successfully");
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }
  const username = req.session.authenticated.username;
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.send("Review deleted successfully");
  } else {
    res.status(404).send("No review found for this user");
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
