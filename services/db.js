const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

// Open database connection
const connectDB = async () => {
    return open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });
};

// Creating the table structure
const initializeDB = async () => {
    const db = await connectDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,  -- Auto-incrementing primary key in SQLite
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,  -- Auto-incrementing primary key
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT,
            published_year INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (title, author)  -- Ensuring uniqueness for title & author
        );

        CREATE TABLE IF NOT EXISTS borrowed_books (
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            borrow_date DATETIME NULL,
            return_date DATETIME NULL,
            is_returned INTEGER DEFAULT 0,  -- Storing boolean as INTEGER (0 or 1)
            PRIMARY KEY (user_id, book_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );

    `);
};

const getRowData = async (query, params) => {
    const db = await connectDB();
    return await db.get(query, params);
}

const getAllData = async (query, params) => {
    const db = await connectDB();
    return await db.all(query, params);
}

const setData = async (query, params) => {
    const db = await connectDB();
    const result = await db.run(query, params);
    return result.lastID;
}

module.exports = { initializeDB, getRowData, getAllData, setData };