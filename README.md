# Book Management System
This is a simple backend system for a hypothetical "Book Management" application built using Node.js. The project demonstrates backend development, including API creation, database operations, and cryptography practices.

## Steps to Run
### 1. **Clone the repository:**
```ssh
git clone https://github.com/sanyamgoel10/Book-Management-System.git
```
### 2. **Install dependencies:**
```ssh
npm install
```
### 3. **Run the application:**
```ssh
node server
```
### 4. **Test the APIs:**
You can use Postman or any API testing tool to test the API endpoints mentioned above. The default link to run the APIs locally is `http://localhost:3000`. The port can be changed from `/config/config.js` file.


## Features

### 1. **User Management**
- **User registration**: Users can register by providing a username and password.
- **Password storage**: Passwords are securely stored using bcrypt hashing, ensuring that even if the database is compromised, user passwords are not exposed.

### 2. **Book Management**
- **Add new books**: Add new books with details such as title, author, genre, and published year.
- **View all books**: View all books in the system.
- **Search books**: Search books by title or author.
- **Update book details**: Update existing book details.
- **Delete books**: Delete books from the system.

### 3. **Borrow/Return Books**
- **Borrow books**: Users can borrow one or more books by their IDs.
- **Return books**: Users can return borrowed books.

## Database Design
A relational database schema has been implemented using SQLite with the following tables:

- **users**: Stores user information with fields for `id`, `username`, `password`, and `created_at`.
- **books**: Stores book details with fields for `id`, `title`, `author`, `genre`, `published_year`, and `created_at`.
- **borrowed_books**: Stores borrowing transactions, linking users to borrowed books with fields for `user_id`, `book_id`, `borrow_date`, `return_date`, and `is_returned`.

The table structure ensures proper relationships and enforces integrity via foreign keys.

## Security and Cryptography
- **Password hashing**: User passwords are hashed using bcrypt before being stored in the database. This ensures passwords are never stored in plaintext.  
- **Password validation**: During login or when performing actions like borrowing or returning books, the entered password is compared to the hashed password in the database using bcrypt's `compare` method.

- **Input validation and sanitization**: All incoming data is validated and sanitized to prevent SQL injection and other security risks.

## Technologies Used
- **Backend Framework**: Node.js
- **Database**: SQLite
- **Cryptography**: bcrypt for password hashing

## API Endpoints
### 1. **User Registration**
- `POST /registerUser`: Register a new user with a username and password.
    - Body: `{ "username": "exampleUser", "password": "userPassword123" }`

### 2. **Book Management**
- `POST /addNewBook`: Add a new book to the system.
    - Body: `{ "title": "Book Title", "author": "Book Author", "genre": "Fiction", "published_year": 2020 }`
- `GET /viewAllBooks`: View all books.
- `POST /searchBook`: Search books by title or author.
    - Body: `{ "title": "Book Title", "author": "Book Author" }`
- `PUT /updateBookDetails/:book_id`: Update book details.
    - Body: `{ "title": "Updated Title", "author": "Updated Author", "genre": "Fiction", "published_year": 2021 }`
- `DELETE /deleteBook/:book_id`: Delete a book.

### 3. **Borrow/Return Books**
- `POST /borrowBook`: Borrow one or more books.
    - Body: `{ "username": "exampleUser", "password": "userPassword123", "book_id": [1, 2] }`
    - `book_id` in request body can be number or array of numbers.
- `POST /returnBook`: Return borrowed books.
    - Body: `{ "username": "exampleUser", "password": "userPassword123", "book_id": 1 }`

## Database Schema (SQLite)
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,  
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,  
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    published_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (title, author)  
);
CREATE TABLE IF NOT EXISTS borrowed_books (
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_date DATETIME NULL,
    return_date DATETIME NULL,
    is_returned INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## Conclusion
This project demonstrates a simple yet secure implementation of a Book Management system using Node.js and SQLite. The system features secure password storage and validation, book management, and borrowing functionalities.

Feel free to fork or contribute to the project! If you have any questions or need further clarifications, feel free to open an issue.
