module.exports = function (app, handlers, logger, db) {
    let middleware = require('../middleware');
    var mongoose = require('mongoose');
    var ArtistModels = require("../models/Artist")

    app.post('/users/login', handlers.login);


    app.post("/StrApi/RegisterUser", async function (req, res, next) {
        try {
            console.log("success", req.body)
            // var find = ArtistModels.newuser.findByIdAndRemove("5d1dd9619499fc74835e6354", function (err, count) {
            //     console.log(err, count)
            // })

            var newuser = await new ArtistModels.newuser(req.body)
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

        } catch (error) {
            logger.log({ level: 'info', message: error + "" })
            res.status(500).send(error)
        }

    }, handlers.login);


    app.post("/StrApi/SavePreferences", middleware.checkToken, async function (req, res) {
        try {
            console.log("success", req.body)
            let query = { uid: req.body.uid };
            let userPreference = {
                Industry: {},
                categories: {}
            } = req.body.preferences


            ArtistModels.newuser.findOneAndUpdate(query, { userPreference: userPreference }, (err, res) => {
                console.log("ers", err, res)
                if (!err) {
                    res.status(200).json({
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        err: err
                    });
                }
            });

        } catch (error) {
            logger.log({ level: 'info', message: error + "" })
            res.status(500).send(error)
        }

    });

    app.post("/StrApi/SavePortfolio", middleware.checkToken, async function (req, res) {
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
                        err: err
                    });
                }
            })

        } catch (error) {
            logger.log({ level: 'info', message: error + "" })
            res.status(500).send(error)
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
                        err: err
                    });
                }
            })

        } catch (error) {
            logger.log({ level: 'info', message: error + "" })
            res.status(500).send(error)
        }

    });

}