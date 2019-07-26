module.exports = function (app, handlers, logger, db) {
    let middleware = require('../middleware');
    var mongoose = require('mongoose');
    var ArtistModels = require("../models/Artist");
    var admin = require("firebase-admin");
    const path = require("path")
    const fs = require("fs-extra")
    const multer = require("multer")

    const profilePictureStorage = multer.diskStorage({
        destination(req, file, cb) {
            // console.log(req.decoded)
            const userId = req.decoded.username;
            const pathToSave = `./uploads/user/${userId}/`;
            // console.log(pathToSave)
            fs.ensureDirSync(pathToSave);
            cb(undefined, pathToSave);

        },
        filename(req, file, cb) {
            try {
                cb(undefined, "/profile_picture.png");
            } catch (err) {
                cb(err, "/profile_picture.png");
            }
        }
    });
    const profilePictureUpload = multer({
        storage: profilePictureStorage
    });


    app.post("/StrApi/actor/UpdateProfilePicture", middleware.checkToken,
        profilePictureUpload.array("profilePic"), async function (req, res) {
            res.status(200).json({
                success: true,
            });
        });


    app.post('/users/login', handlers.login);
    app.post("/StrApi/RegisterUser", async function (req, res, next) {
        try {
            console.log("success", req.body)
            // var find = ArtistModels.newuser.findByIdAndRemove("5d1dd9619499fc74835e6354", function (err, count) {
            //     console.log(err, count)
            // })
            admin.auth().verifyIdToken(req.body.idToken)
                .then(function (decodedToken) {
                    console.log(decodedToken)
                    req.body.uid = decodedToken.uid;
                    ArtistModels.newuser.find({ "uid": req.body.uid }, function (err, docs) {
                        console.log(docs)
                        if (!docs) {
                            var newuser = new ArtistModels.newuser(req.body)
                            newuser.DOB instanceof Date
                            newuser.save((err, res) => {
                                console.log("ers", err, res)
                                if (!err) {
                                    next()
                                } else {
                                    res.status(500).json({
                                        success: false,
                                        err: err
                                    });
                                }
                            })
                        } else {
                            console.log("User Exists")
                            res.status(200).json({ result: "User Exists" })
                        }
                    })

                })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    }, handlers.login);



    app.post("/StrApi/CheckUserExists", async function (req, res) {
        try {
            console.log("success", req.body);
            admin.auth().verifyIdToken(req.body.idToken)
                .then(function (decodedToken) {
                    console.log(decodedToken)
                    req.body.uid = decodedToken.uid;
                    ArtistModels.newuser.find({ "uid": req.body.uid }, function (err, docs) {
                        if (!docs) {
                            res.status(200).send("No User Found")
                        } else {
                            res.status(500).send("User Exists")
                        }
                    })
                })

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });


    app.post("/StrApi/SavePreferences", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body);
            let query = { uid: req.body.uid };
            let userPreference = {
                Industry: [],
                categories: {}
            } = req.body.preferences;

            ArtistModels.newuser.findOneAndUpdate(query, { userPreference: userPreference }, (err, res) => {
                console.log("ers", err, res)
                if (!err) {
                    res.status(200).json({
                        success: true
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: err
                    });
                }
            });

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });

    app.post("/StrApi/SavePortfolio", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body)
            let query = { uid: req.body.uid };
            let userPortfolio = {
                Experience: {},
                Talents: []
            } = req.body.portfolio;

            ArtistModels.newuser.findOneAndUpdate(query, { "$push": { "userPortfolio.Talents": { "$each": userPortfolio.Talents } } }, (err, response) => {
                if (!err) {
                    console.log(response)
                    res.status(200).json({
                        success: true
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });


    app.post("/StrApi/UpdateUserTalents", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body)
            let query = { uid: req.decoded.username };
            let Talents = req.body.Talents;

            ArtistModels.newuser.findOneAndUpdate(query, { "$push": { "userPortfolio.Talents": { "$each": Talents } } }, (err, response) => {
                if (!err) {
                    console.log(response)
                    res.status(200).json({
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });



    app.post("/StrApi/UpdateUserExperience", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body);
            let query = { uid: req.decoded.username };
            let Experience = req.body.Experience;

            ArtistModels.newuser.findOneAndUpdate(query, { "userPortfolio.Experience": Experience }, (err, response) => {
                if (!err) {
                    console.log(response)
                    res.status(200).json({
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });


    app.post("/StrApi/actor/Gethome", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body)
            let query = { uid: req.body.uid };
            let userPortfolio = {
                Experience: {},
                Talents: []
            } = req.body.portfolio

            ArtistModels.newuser.findOneAndUpdate(query, { userPortfolio: userPortfolio }, (err, res) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: `${err}`
                    });
                }
            })

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(500).json({ error: `${error}` })
        }

    });




}