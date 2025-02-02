const express = require('express');
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const router = require('./routes/routes.js');
app.use("/", router);

// 404 Error Handler
app.use((req, res) => {
    return res.status(404).json({
        error: "Invalid URL"
    });
});

module.exports = app;