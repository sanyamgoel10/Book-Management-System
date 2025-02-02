const { getRowData, getAllData, setData } = require("../services/db.js");

class BookController{
    async addNewBook(req, res){
        try {
            let reqBody = req.body;

            if('undefined' == typeof reqBody.title || !checkValidString(reqBody.title)){
                return res.status(400).json({ 
                    message: "title missing in request"
                }); 
            }

            if('undefined' == typeof reqBody.author || !checkValidString(reqBody.author)){
                return res.status(400).json({
                    message: "author missing in request"
                }); 
            }

            if('undefined' == typeof reqBody.genre || !checkValidString(reqBody.genre)){
                return res.status(400).json({
                    message: "genre missing in request"
                }); 
            }

            if('undefined' == typeof reqBody.published_year || !(/^\d+$/).test(reqBody.published_year) || Number(reqBody.published_year) <= 0){
                return res.status(400).json({
                    message: "published_year missing in request"
                }); 
            }
            reqBody.published_year = Number(reqBody.published_year);

            let checkExistingBook = await getRowData(`select *, id, title, author, genre, published_year from books where title = ? and author = ?`, [reqBody.title, reqBody.author]);
            if('undefined' != typeof checkExistingBook && 'object' == typeof checkExistingBook){
                return res.status(409).json({
                    message: `Book already present`,
                    book_id: checkExistingBook.id,
                    book_title: checkExistingBook.title,
                    book_author: checkExistingBook.title,
                    book_genre: checkExistingBook.genre,
                    book_published_year: checkExistingBook.published_year
                });
            }

            let insertBook = await setData(`insert into books (title, author, genre, published_year) values (?, ?, ?, ?)`, [reqBody.title, reqBody.author, reqBody.genre, reqBody.published_year]);

            return res.status(201).json({ 
                message: "Book registered successfully",
                book_id: insertBook
            });
        } catch (error) {
            console.error("Error in bookController:", error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    async viewAllBooks(req, res){
        try {
            let getAllBooks = await getAllData(`select * from books`, []);
            if('undefined' != typeof getAllBooks && Array.isArray(getAllBooks) && getAllBooks.length > 0){
                return res.status(200).json({
                    message: "Books Found",
                    data: getAllBooks
                });
            }
            return res.status(404).json({
                message: "No Books Found"
            });
        } catch (error) {
            console.error("Error in bookController:", error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    async searchBook(req, res){
        try {
            let reqBody = req.body;
            if(('undefined' == typeof reqBody.title || reqBody.title == null) && ('undefined' == typeof reqBody.author || reqBody.author == null)){
                return res.status(400).json({
                    message: "title and author missing in request"
                }); 
            }
            
            let bookTitle = ('undefined' != typeof reqBody.title) ? reqBody.title : null;
            let bookAuthor = ('undefined' != typeof reqBody.author) ? reqBody.author : null;

            if(bookTitle != null && (!checkValidString(bookTitle))){
                return res.status(400).json({
                    message: "title should be string"
                }); 
            }

            if(bookAuthor != null && (!checkValidString(bookAuthor))){
                return res.status(400).json({
                    message: "author should be string"
                }); 
            }

            let selectQuery = `select id, title, author, genre, published_year from books where`;
            let queryParams = [];
            if(bookTitle != null && bookAuthor != null){
                selectQuery += ` title = ? and author = ?`;
                queryParams = [bookTitle, bookAuthor];
            }else if(bookTitle != null){
                selectQuery += ` title = ?`;
                queryParams = [bookTitle];
            }else{
                selectQuery += ` author = ?`;
                queryParams = [bookAuthor];
            }

            let booksData = await getAllData(selectQuery, queryParams);

            if('undefined' != typeof booksData && Array.isArray(booksData) && booksData.length > 0){
                return res.status(200).json({
                    message: "Books Found",
                    data: booksData
                });
            }
            return res.status(404).json({
                message: "No books found"
            });            
        } catch (error) {
            console.error("Error in bookController:", error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    async updateBookDetails(req, res){
        try {
            let reqBody = req.body;
            let reqParam = req.params;

            if('undefined' == typeof reqParam.book_id || !(/^\d+$/).test(reqParam.book_id) || Number(reqParam.book_id) < 1){
                return res.status(400).json({
                    message: "book_id missing in request"
                });
            }
            reqParam.book_id = Number(reqParam.book_id);

            let checkValidBook = await getRowData(`select id, title, author, genre, published_year from books where id = ?`, [reqParam.book_id]);
            if('undefined' == typeof checkValidBook){
                return res.status(404).json({
                    message: "Book not found for this book_id"
                });
            }

            let currTitle = checkValidBook.title;
            let currAuthor = checkValidBook.author;

            let newTitle = ('undefined' != typeof reqBody.title && reqBody.title != null) ? reqBody.title: null;
            let newAuthor = ('undefined' != typeof reqBody.author && reqBody.author != null) ? reqBody.author: null;
            let newGenre = ('undefined' != typeof reqBody.genre && reqBody.genre != null) ? reqBody.genre: null;
            let newPY = ('undefined' != typeof reqBody.published_year && reqBody.published_year != null) ? reqBody.published_year: null;

            if(newTitle != null && !checkValidString(newTitle)){
                return res.status(400).json({
                    message: "title should be non empty string"
                });
            }
            if(newAuthor != null && !checkValidString(newAuthor)){
                return res.status(400).json({
                    message: "author should be non empty string"
                });
            }
            if(newGenre != null && !checkValidString(newGenre)){
                return res.status(400).json({
                    message: "genre should be non empty string"
                });
            }
            if(newPY != null && (!(/^\d+$/).test(newPY) || Number(newPY) <= 0)){
                return res.status(400).json({
                    message: "published_year should be positive number"
                });
            }
            newPY = (newPY != null) ? Number(newPY) : newPY;

            if(newTitle != null && newAuthor != null){
                let checkDuplBook = await getRowData(`select id from books where id != ? and title = ? and author = ?`, [reqParam.book_id, newTitle, newAuthor]);
                if('undefined' != typeof checkDuplBook){
                    return res.status(409).json({
                        message: "Book already found with same title and author"
                    });
                }
            }else if(newTitle != null){
                let checkDuplBook = await getRowData(`select id from books where id != ? and title = ? and author = ?`, [reqParam.book_id, newTitle, currAuthor]);
                if('undefined' != typeof checkDuplBook){
                    return res.status(409).json({
                        message: "Book already found with same title and author"
                    });
                }
            }else if(newAuthor != null){
                let checkDuplBook = await getRowData(`select id from books where id != ? and title = ? and author = ?`, [reqParam.book_id, currTitle, newAuthor]);
                if('undefined' != typeof checkDuplBook){
                    return res.status(409).json({
                        message: "Book already found with same title and author"
                    });
                }
            }

            let updateQuery = `update books set `;
            let updateParams = [];
            if(newTitle != null){
                updateQuery += ` title = ?`;
                updateParams.push(newTitle);
            }
            if(newAuthor != null){
                updateQuery += (newTitle != null) ? `,` : ``;
                updateQuery += ` author = ?`;
                updateParams.push(newAuthor);
            }
            if(newGenre != null){
                updateQuery += (newTitle != null || newAuthor != null) ? `,` : ``;
                updateQuery += ` genre = ?`;
                updateParams.push(newGenre);
            }
            if(newPY != null){
                updateQuery += (newTitle != null || newAuthor != null || newGenre != null) ? `,` : ``;
                updateQuery += ` published_year = ?`;
                updateParams.push(newPY);
            }
            updateQuery += ` where id = ?`;
            updateParams.push(reqParam.book_id);

            await setData(updateQuery, updateParams);

            return res.status(200).json({
                message: "Book updated successfully"
            });
        } catch (error) {
            console.error("Error in bookController:", error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    async deleteBook(req, res){
        try{
            let reqParam = req.params;

            if('undefined' == typeof reqParam.book_id || !(/^\d+$/).test(reqParam.book_id) || Number(reqParam.book_id) < 1){
                return res.status(400).json({
                    message: "book_id missing in request"
                });
            }
            reqParam.book_id = Number(reqParam.book_id);

            let checkValidBook = await getRowData(`select id, title, author, genre, published_year from books where id = ?`, [reqParam.book_id]);
            if('undefined' == typeof checkValidBook){
                return res.status(404).json({
                    message: "Book not found for this book_id"
                });
            }

            await setData(`delete from books where id = ?`, [reqParam.book_id]);

            return res.status(200).json({
                message: "Book deleted successfully"
            });
        } catch (error) {
            console.error("Error in bookController:", error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
}

module.exports = new BookController();

const checkValidString = function(str){
    return ('string' == typeof str && str.trim() != '');
}