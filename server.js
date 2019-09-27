const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./config');
const middleware = require('./middleware');
const winston = require("winston")
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require("fs");
const path = require("path")
var admin = require("firebase-admin");


const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'info' })
    ]
});

logger.add(new winston.transports.Console({
    format: winston.format.simple()
}));



class HandlerGenerator {
    login(req, res) {
        try {
            let username = req.body.uid;
            if (username) {
                let token = jwt.sign({ username: username },
                    config.secret,
                    {
                        // expiresIn: '24h' // expires in 24 hours
                    }
                );
                // return the JWT token for the future API calls
                res.status(200).json({
                    success: true,
                    message: 'Exists',
                    token: token
                });

            } else {
                res.send(400).json({
                    success: false,
                    message: 'Authentication failed! Please check the request'
                });
            }
        } catch (error) {
            logger.log(error)
        }

    }
    index(req, res) {
        res.status(500).send("This route has nothing")
    }
}

//db Connection
// process.env.MONGODB_URI_MERCHANT;
async function connectdb() {
    // console.log("reading", config.dburl);
    mongoose.connect(config.dburl, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    connection = mongoose.connection;
    connection.on("connected", () => {
        console.log('\x1b[36m%s\x1b[0m ', 'Connected DB 🔄');
    })
    connection.on("error", (err) => {
        console.log(err)
    });
    return connection
}


// Starting point of the server
function main() {
    let app = express(); // Export app for other routes to use
    let handlers = new HandlerGenerator();
    const port = process.env.PORT || 3000;
    app.use(bodyParser.urlencoded({ // Middleware
        extended: true
    }));
    app.use(bodyParser.json());
    app.use("/uploads", express.static(__dirname + "/uploads"));
    // Routes & Handlers
    app.use(morgan("combined", {
        stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
    }))
    app.get('/', middleware.checkToken, handlers.index);
    // app.listen(port, () => console.log(`Server is listening on port: ${port}`));
    // require("./Routes/routes")(app, handlers);
    var connection = connectdb()
    require("./controllers/users")(app, handlers, logger, connection)
    require("./controllers/posts")(app, handlers, logger, connection)
     require("./controllers/main")(app, handlers, logger)
    // Start the server
    app.listen(port, () => {
        ;
        console.log('\x1b[31m%s\x1b[0m ', 'Started At ' + new Date());
        console.log('Insert on port ' + port);
    })
    // console.log('\x1b[36m%s\x1b[0m ', 'Connected DB');  //cyan
    admin.initializeApp({
        credential: admin.credential.cert(config.BaseSecreat),
        databaseURL: "https://staara-e47c3.firebaseio.com"
    });
}
main();