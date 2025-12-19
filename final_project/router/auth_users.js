const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'user1', password: 'pass1' },  // Example users
    { username: 'user2', password: 'pass2' }
  ];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT token
    const token = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });

    // Save token in session
    req.session.authorization = {
        accessToken: token
    };

    return res.status(200).json({ message: "User logged in successfully", token: token });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // Assuming JWT decoded user info is here
  
    if (!review) {
      return res.status(400).json({ message: "Review text is required as a query parameter" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Initialize reviews object if not present
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // Add or update the user's review
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
