const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Add new user
    users.push({ username, password });
  
    return res.status(201).json({ message: "User registered successfully" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("No books available");
        }
      })
      .then((books) => res.status(200).json(books))
      .catch((err) => res.status(500).json({ message: err }));
    });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();  
    new Promise((resolve, reject) => {
        let matchingBooks = {};
        for (let key in books) {
          if (books[key].author.toLowerCase() === author) {
            matchingBooks[key] = books[key];
          }
        }
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject("No books found by this author");
        }
      })
      .then(books => res.status(200).json(books))
      .catch(err => res.status(404).json({ message: err }));
    });
    
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    new Promise((resolve, reject) => {
        let matchingBooks = {};
        for (let key in books) {
          if (books[key].title.toLowerCase() === title) {
            matchingBooks[key] = books[key];
          }
        }
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject("No books found with this title");
        }
      })
      .then(books => res.status(200).json(books))
      .catch(err => res.status(404).json({ message: err }));
});
    

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
