let jwt = require('jsonwebtoken');
const config = require('./config.js');

let checkToken = (req, res, next) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }

            if (token) {
                jwt.verify(token, config.secret, (err, decoded) => {
                    if (err) {
                        return res.json({
                            success: false,
                            message: 'Token is not valid❌❌❌❌'
                        });
                    } else {
                        req.decoded = decoded;
                        next();
                    }
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Auth token is not supplied❌❌❌❌❌'
                });
            }
        } else {
            return res.json({
                success: false,
                message: 'Auth token is not supplied❌❌❌❌❌'
            });
        }

    } catch (err) {
        console.log("error", err)
        res.status(500).json({ error: `${err}` })
    }

};

module.exports = {
    checkToken: checkToken
}