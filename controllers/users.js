module.exports = (app, handlers, logger, db) => {
    let middleware = require('../middleware');
    var mongoose = require('mongoose');
    var ArtistModels = require("../models/Artist");
    var admin = require("firebase-admin");
    const path = require("path")
    const fs = require("fs-extra")
    const multer = require("multer")
    const crypto = require('crypto');
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
    const UserUploadsStorage = multer.diskStorage({
        destination(req, file, cb) {
            // console.log(req.decoded)
            const userId = req.decoded.username;
            const pathToSave = `./uploads/user/${userId}/uploads`;
            // console.log(pathToSave)
            fs.ensureDirSync(pathToSave);
            cb(undefined, pathToSave);

        },
        filename(req, file, cb) {
            try {
                // console.log(file)
                crypto.pseudoRandomBytes(16, (err, raw) => {
                    cb(null, raw.toString('hex') + path.extname(file.originalname));
                });
                // cb(undefined, file.originalname);
            } catch (err) {
                cb(err, file.originalname);
            }
        }
    });


    const imageFilter = (req, file, cb) => {
        // accept image only
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    };




    const profilePictureUpload = multer({
        storage: profilePictureStorage,
        fileFilter: imageFilter
    });

    const UserUploads = multer({
        storage: UserUploadsStorage,
    });


    app.post("/StrApi/actor/UpdateProfilePicture", middleware.checkToken,
        profilePictureUpload.single("profilePic"), async function (req, res) {
            if (req.files) {
                res.status(200).json({
                    success: true,
                });
            } else {
                res.status(400).json({
                    success: false,
                    msg: "No File Found"
                });
            }
        });

    app.post("/StrApi/actor/UploadFiles", middleware.checkToken,
        UserUploads.array("uploads"), async function (req, res) {
            console.log(req.files)
            const query = { uid: req.decoded.username }
            if (req.files) {
                ArtistModels.newuser.findOneAndUpdate(query, { $addToSet: { "Uploads": { "$each": req.files } } }, (err, response) => {
                    console.log(err, response)
                    res.status(200).json({
                        success: true,
                    });
                })
            } else {
                res.status(400).json({
                    success: false,
                    msg: "No File Found"
                });
            }


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
                    //req.body.uid = decodedToken.uid;
                    ArtistModels.newuser.find({ "uid": req.body.uid }, function (err, docs) {
                        console.log(docs)
                        if (docs) {
                            var newuser = new ArtistModels.newuser(req.body)
                            newuser.DOB instanceof Date
                            newuser.save((err, ressssss) => {
                                console.log("ers", err, ressssss)
                                if (!err) {
                                    next()
                                } else {
                                    res.status(400).json({
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
            res.status(400).json({ error: `${error}` })
        }

    }, handlers.login);



    app.post("/StrApi/CheckUserExists", async function (req, res) {
        try {
            console.log("success", req.body);
            admin.auth().verifyIdToken(req.body.idToken)
                .then(function (decodedToken) {
                    console.log(decodedToken)
                    req.body.uid = decodedToken.uid;
                    ArtistModels.newuser.find({ "uid": req.body.uid }, function (err, docs, next) {
                        if (!docs) {
                            res.status(200).send("No User Found")
                        } else {
                            next()
                        }
                    })
                })

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
        }

    }, handlers.login);


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
                    res.status(400).json({
                        success: false,
                        err: err
                    });
                }
            });

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
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
                    res.status(400).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
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
                    res.status(400).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
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
                    res.status(400).json({
                        success: false,
                        err: err
                    });
                }
            })

        } catch (error) {
            console.log(error)
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
        }

    });


    app.post("/StrApi/actor/GetUserDetails", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body)
            let query = { uid: req.decoded.username };

            ArtistModels.newuser.findOne(query, (err, response) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                        response: response
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        err: `${err}`
                    });
                }
            })

        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
        }

    });
    app.get('/GetUsers', async function (req, res) {
        try {
            ArtistModels.newuser.find()
                .select("firstname lastname mobileno gender email userPortfolio city")
                .exec()
                .then((response, error) => {
                    if (!error) {
                        res.status(200).json({
                            success: true,
                            msg: response
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: `${err}`
                        });
                    }

                })
        } catch (error) {
            logger.log({ level: 'info', message: `${error}` })
            res.status(400).json({ error: `${error}` })
        }

    })




}