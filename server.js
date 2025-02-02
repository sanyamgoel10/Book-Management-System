const config = require("./config/config.js");
const { initializeDB } = require("./services/db.js");
const app = require("./app.js");

const PORT = config.port || 3000;

const startServer = async () => {
    try {
        await initializeDB();
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();