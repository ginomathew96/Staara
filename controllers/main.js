module.exports = function (app, handlers, logger) {
    var admin = require("firebase-admin");
    var firebase = require("firebase");
    var db = admin.firestore();
    let middleware = require('../middleware');

    app.post('/GetAndroidConfig', middleware.checkToken, async function (req, res) {
        req.on('data', function (chunk) {
            try {
                var version = JSON.parse(chunk.toString()).version;
                db.collection('appConfig').doc("android")
                    .get()
                    .then(response => {
                        console.log(response.data());
                        const result = response.data();
                        const AppVersion = version == result.version ? true : false;
                        res.status(200).send(AppVersion);
                    });
                // db.getCollections().then(collections => {
                //     res.json({ "result": collections});
                //     for (let collection of collections) {
                //         console.log(`Found collection with id: ${collection.id}`);

                //     }
                // });
            } catch (ex) {
                logger.log(ex);
                res.status(500).send(ex);
                console.log(ex);
            }
        });
    });
}