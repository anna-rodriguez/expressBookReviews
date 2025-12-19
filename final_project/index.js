const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const regd_users = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const public_users = require('./router/general.js').general;  // Import general routes
const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true, cookie: {secure: false}}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

app.use("/customer", regd_users);
app.use("/", genl_routes);
app.use("/", public_users);

app.listen(PORT,()=>console.log("Server is running"));
