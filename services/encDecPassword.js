const bcrypt = require('bcrypt');
const config = require("../config/config.js");
const saltRounds = config.EncryptSaltRounds || 10;

class PasswordService {
    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            console.error("Error hashing password:", error);
            throw new Error('Password hashing failed');
        }
    }

    async comparePassword(enteredPassword, storedHashedPassword) {
        try {
            return await bcrypt.compare(enteredPassword, storedHashedPassword)
        } catch (error) {
            console.error("Error comparing passwords:", error);
            throw new Error('Password comparison failed');
        }
    }
}

module.exports = new PasswordService();