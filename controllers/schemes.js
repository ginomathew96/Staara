module.exports = function (app, handlers, logger) {
    var admin = require("firebase-admin");
    var firebase = require("firebase");
    var serviceAccount = require('../config').config;
    var db = admin.firestore();
    let middleware = require('../middleware');
    // var ref = db.ref("users");

    // Attach an asynchronous callback to read the data at our posts reference
    // ref.on("child_added", function (snapshot) {
    //     console.log('Hi')
    //     console.log(snapshot.val());
    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // }); 
    app.post('/test', function (req, res) {
        res.json({ result: true });
    })
    app.post('/strapi/SaveEmployeeSchemes/', middleware.checkToken, async function (req, res) {
        try {
            var userdata = req.body;
            var idToken = userdata.idToken;
            if (userdata.gender != 'F' && userdata.gender != 'M') {
                res.json({ result: "Wrong Data" });
            } else {
                admin.auth().verifyIdToken(idToken)
                    .then(function (decodedToken) {
                        var batch = db.batch()
                        var uid = decodedToken.uid;
                        // console.log(uid);
                        var ref = db.collection("Users").doc(userdata.type).collection("users")
                        var ref2 = db.collection(uid).doc('userdata')
                        batch.set(ref2, {
                            firstname: userdata.firstname, lastname: userdata.lastname,
                            gender: userdata.gender, mobileno: userdata.mobileno, DOB: userdata.DOB,
                            country: userdata.country, state: userdata.state, city: userdata.city,
                            zipcode: userdata.zipcode, email: userdata.emailid, type: userdata.type
                        });

                        ref.get()
                            .then(snapshot => {
                                // console.log(response.data());
                                var exitflag = 1;
                                snapshot.forEach(doc => {
                                    console.log(doc.id, '=>', doc.data());
                                    var item = doc.data();
                                    if (item.id == uid) {
                                        exitflag = 0;
                                    }
                                })
                                if (exitflag == 1) {
                                    batch.set(ref, {
                                        id: uid, firstname: userdata.firstname, lastname: userdata.lastname,
                                        gender: userdata.gender, mobileno: userdata.mobileno, DOB: userdata.DOB,
                                        country: userdata.country, state: userdata.state, city: userdata.city,
                                        zipcode: userdata.zipcode, email: userdata.emailid, type: userdata.type
                                    })
                                    batch.update(db.collection("Users").doc(userdata.type),
                                        {
                                            list: admin.firestore.FieldValue.arrayUnion(uid)
                                        })
                                    batch.commit().then(function () {
                                        res.status(200).send("Saved Successfully");
                                    })
                                } else {
                                    res.status(200).send("User Already Exists");
                                }

                            });

                    }).catch(function (error) {
                        console.log(error);
                        res.status(500).send(error);
                    });

            }

        } catch (ex) {
            logger.log(ex);
            res.status(500).send(ex);
            console.log(ex)
        }
    });

    // app.get('/getusers', function (req, res) {
    //     // var ref = db.ref("staara-e47c3");

    //     // Attach an asynchronous callback to read the data at our posts reference
    //     async function getdata() {
    //         const collection = db.collection('users');
    //         const query = collection
    //             .where('name', '==', 'vishnu');
    //         const snapshot = await query.get();
    //         snapshot.docs.map(doc => { res.json({ "result": doc.data() }); })
    //         // .then(doc => {
    //         //     console.log(doc)

    //         // })
    //         // .catch(err => {
    //         //     res.json({ "result": err });
    //         // })
    //     }
    //     getdata();
    // });

    app.get('/userid', middleware.checkToken, async function (req, res) {
        firebase.auth().get((user) => {
            if (user) {
                console.log(user.uid);
                res.json({ "result": user });
            }
        });
    });

    app.get('/GetSchemes', middleware.checkToken, async function (req, res) {
        try {
            db.collection('schemes').doc("schemes")
                .get()
                .then(response => {
                    console.log(response.data());
                    const result = response.data();
                    res.status(200).send(result);
                })
        } catch (ex) {
            logger.log(ex);
            res.status(500).send(ex);
            console.log(ex);
        }
    });
};