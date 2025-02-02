const { getRowData, getAllData, setData } = require("../services/db.js");
const encDecPassword = require('../services/encDecPassword.js');

class UserController{
    async registerUser(req, res){
        try {
            let reqBody = req.body;

            if('undefined' == typeof reqBody.username || reqBody.username == null || 'string' != typeof reqBody.username || (reqBody.username).trim() == ''){
                return res.status(400).json({ 
                    message: "username missing in request" 
                }); 
            }
            if('undefined' == typeof reqBody.password || reqBody.password == null || 'string' != typeof reqBody.password || (reqBody.password).trim() == ''){
                return res.status(400).json({ 
                    message: "password missing in request" 
                });
            }
            let checkUserName = await getRowData(`select * from users where username = ?`, [reqBody.username]);
            if('undefined' != typeof checkUserName){
                return res.status(409).json({
                    message: "username already found" 
                });
            }

            let encryptedPass = await encDecPassword.hashPassword(reqBody.password);

            let insertUser = await setData(`insert into users (username, password) values (?, ?)`, [reqBody.username, encryptedPass]);

            return res.status(201).json({
                message: "User registered successfully",
                user_id: insertUser
            });
        } catch (error) {
            console.error("Error in loginController:", error);
            return res.status(500).json({ 
                message: "Internal Server Error" 
            });
        }
    }

    async borrowBook(req, res){
        try {
            let reqBody = req.body;

            // if('undefined' == typeof reqBody.user_id || !(/^\d+$/).test(reqBody.user_id) || Number(reqBody.user_id) < 1){
            //     return res.status(400).json({
            //         message: "user_id missing in request" 
            //     });
            // }
            // reqBody.user_id = Number(reqBody.user_id);

            reqBody.user_id = Number(req.user_id);

            if('undefined' == typeof reqBody.book_id || (!(/^\d+$/).test(reqBody.book_id) && !Array.isArray(reqBody.book_id))){
                return res.status(400).json({
                    message: "book_id missing in request" 
                });
            }

            let booksList = [];
            if((/^\d+$/).test(reqBody.book_id)){
                if(Number(reqBody.book_id) < 1){
                    return res.status(400).json({
                        message: "book_id should be positive integer" 
                    });
                }
                reqBody.book_id = Number(reqBody.book_id);
                booksList.push(reqBody.book_id);
            }else{
                let allNotNum = false;
                for(let i in reqBody.book_id){
                    let currNum = reqBody.book_id[i];
                    if(!(/^\d+$/).test(currNum) || Number(currNum) < 1){
                        allNotNum = true;
                        break;
                    }
                    reqBody.book_id[i] = Number(reqBody.book_id[i]);
                }
                if((reqBody.book_id).length < 1 || allNotNum){
                    return res.status(400).json({
                        message: "book_id should contain positive integers" 
                    });
                }
                booksList = [...(reqBody.book_id)];
            }

            // let checkUser = await getRowData(`select id from users where id = ?`, [reqBody.user_id]);
            // if('undefined' == typeof checkUser){
            //     return res.status(404).json({
            //         message: "user_id not found"
            //     });
            // }

            let placeHolders = booksList.map(() => "?").join(", ");
            let checkBooks = await getAllData(`select id from books where id in (${placeHolders})`, booksList);
            if('undefined' == typeof checkBooks || !Array.isArray(checkBooks) || checkBooks.length != booksList.length){
                return res.status(404).json({
                    message: "book_id not found"
                });
            }

            for(let i in booksList){
                await setData(`insert or replace into  borrowed_books (user_id, book_id, borrow_date, return_date, is_returned) values (?, ?, CURRENT_TIMESTAMP, NULL, 0)`, [reqBody.user_id, booksList[i]]);
            }

            return res.status(200).json({
                message: "Books assigned to user successfully"
            });
        } catch (error) {
            console.error("Error in loginController:", error);
            return res.status(500).json({ 
                message: "Internal Server Error" 
            });
        }
    }

    async returnBook(req, res){
        try {
            let reqBody = req.body;

            reqBody.user_id = Number(req.user_id);

            // if('undefined' == typeof reqBody.user_id || !(/^\d+$/).test(reqBody.user_id) || Number(reqBody.user_id) < 1){
            //     return res.status(400).json({
            //         message: "user_id missing in request" 
            //     });
            // }
            // reqBody.user_id = Number(reqBody.user_id);

            if('undefined' == typeof reqBody.book_id || !(/^\d+$/).test(reqBody.book_id) || Number(reqBody.book_id) < 1){
                return res.status(400).json({
                    message: "book_id missing in request" 
                });
            }
            reqBody.book_id = Number(reqBody.book_id);

            let checkBorrowedBook = await getRowData(`select count(*) as isFound from borrowed_books where user_id = ? and book_id = ? and is_returned = 1`, [reqBody.user_id, reqBody.book_id]);
            if('undefined' != typeof checkBorrowedBook && 'object' == typeof checkBorrowedBook && 'undefined' != typeof checkBorrowedBook.isFound && Number(checkBorrowedBook.isFound) > 0){
                return res.status(400).json({
                    message: "No book present borrowed by user" 
                });
            }

            await setData(`update borrowed_books set return_date = CURRENT_TIMESTAMP, is_returned = 1 where user_id = ? and book_id = ?`, [reqBody.user_id, reqBody.book_id]);

            return res.status(200).json({
                message: "Book returned" 
            });
        } catch (error) {
            console.error("Error in loginController:", error);
            return res.status(500).json({ 
                message: "Internal Server Error" 
            });
        }
    }
}

module.exports = new UserController();