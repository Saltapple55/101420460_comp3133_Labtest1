// const express = require('express');
// const UserModel = require('./backend/models/user');
// const app = express();

// auth.js - Check if user is logged in
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token"); // Get stored token

    // Redirect to login page if token is missing
    if (token===null) {
       console.log("need to login")
        window.location.href = "login.html";
    }
    else{
        console.log("token found: "+token)
    }
});
