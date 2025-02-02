const { getRowData } = require("./db.js");
const encDecPassword = require('./encDecPassword.js');

module.exports = async (req, res, next) => {
    try{
        if('undefined' == typeof req.body.username || 'undefined' == typeof req.body.password){
            return res.status(400).json({
                message: "username and password required in request body"
            });
        }

        if(!checkValidString(req.body.username) || !checkValidString(req.body.password)){
            return res.status(400).json({
                message: "username and password should be valid string"
            });
        }

        let getUsername = await getRowData(`select id, username, password from users where username = ?`, [req.body.username]);
        if('undefined' == typeof getUsername){
            return res.status(404).json({
                message: "username not found"
            });
        }

        if(!await encDecPassword.comparePassword(req.body.password, getUsername.password)){
            return res.status(404).json({
                message: "Invalid Password"
            });
        }

        req.user_id = getUsername.id;
        
        return next();
    }catch (error) {
        console.error("Error in validateUser:", error);
        return res.status(500).json({ 
            message: "Internal Server Error" 
        });
    }
}

const checkValidString = function(str){
    return ('string' == typeof str && str.trim() != '');
}