const express = require("express");
const router = express.Router();

// Controllers
const loginController = require('../controllers/loginController.js');
const bookController = require('../controllers/bookController.js');

// Services
const validateUser = require('../services/validateUser.js');

// Routes
router.post("/registerUser", loginController.registerUser);
router.post("/addNewBook", bookController.addNewBook);
router.get("/viewAllBooks", bookController.viewAllBooks);
router.post("/searchBook", bookController.searchBook);
router.put('/updateBookDetails/:book_id', bookController.updateBookDetails);
router.delete('/deleteBook/:book_id', bookController.deleteBook);
router.post('/borrowBook', validateUser, loginController.borrowBook);
router.post('/returnBook', validateUser, loginController.returnBook);

module.exports = router;