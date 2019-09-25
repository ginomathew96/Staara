module.exports = function (app, handlers, logger, db) {
    let middleware = require('../middleware');
    var mongoose = require('mongoose');
    var Postmodel = require("../models/Artist");

    app.post("/StrApi/Savenewposts", middleware.checkToken, async function (req, res) {
        try {
            var uid = req.decoded.username;
            var dataset = req.body;
            console.log(new Date(dataset.startDate))
            Postmodel.newuser.findOne({ uid: uid }, (error, userres) => {
                var newpost = new Postmodel.Posts({
                    PostedBy: userres._id, active: true,
                    name: dataset.name,
                    description: dataset.desc,
                    location: dataset.location,
                    industry: dataset.industry,
                    gender: dataset.gender,
                    ageStart: dataset.ageStart,
                    ageEnd: dataset.ageEnd,
                    startDate: new Date(dataset.startDate)
                })
                newpost.save((error, response) => {
                    console.log(error)
                    if (!error) {
                        res.status(200).json({
                            success: true,
                            msg: `Post Saved.`
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: `${error}`
                        });
                    }
                })
            })


        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })

    app.post("/StrApi/UpdatePosts", middleware.checkToken, async function (req, res) {
        try {
            req.body.uid = req.decoded.username;
            console.log(req.body)
            Postmodel.Posts.findByIdAndUpdate(req.body._id, req.body, (error, response) => {
                console.log(response)
                if (!error) {
                    res.status(200).json({
                        success: true,
                        msg: `Post Updated.`
                    });
                } else {
                    console.log(error)
                    res.status(400).json({
                        success: false,
                        msg: `${error}`
                    });
                }
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })

    app.post("/StrApi/DeletePosts", middleware.checkToken, async function (req, res) {
        try {
            req.body.uid = req.decoded.username;
            console.log(req.body)
            var id = req.body._id
            Postmodel.Posts.findByIdAndUpdate(id, { status: false }, (err, response) => {
                console.log(err, response)
                if (!err) {
                    res.status(200).json({
                        success: true,
                        msg: `Post Deleted`
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        msg: `${error}`
                    });
                }
            })

        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })


    app.post("/StrApi/GetPostDetails", middleware.checkToken, async function (req, res) {
        try {
            req.body.uid = req.decoded.username;
            // console.log(req.body)
            Postmodel.Posts.findById(req.body._id)
                .populate("PostedBy", "firstname lastname _id")
                .select("_id PostedBy active CreatedDate name description")
                .exec()
                .then((response, error) => {
                    console.log(response)
                    if (!error) {
                        res.status(200).json({
                            success: true,
                            msg: response
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: `${error}`
                        });
                    }
                })

        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })


    app.post("/StrApi/GetAllPosts", middleware.checkToken, async function (req, res) {
        try {
            console.log(req.decoded.username)
            req.body.uid = req.decoded.username;
            // console.log(req.body)
            Postmodel.Posts.find()
                .populate("PostedBy", "firstname lastname _id")
                .select("_id PostedBy active CreatedDate name description")
                .exec()
                .then((response, error) => {
                    console.log(response)
                    if (!error) {
                        res.status(200).json({
                            success: true,
                            msg: response
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: `${error}`
                        });
                    }
                })

        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })

    app.post("/StrApi/sendRequest", middleware.checkToken, async function (req, res) {
        try {
            var uid = req.decoded.username;
            var id = mongoose.Types.ObjectId();
            Postmodel.newuser.findOne({ uid: uid }, (error, userres) => {
                Postmodel.Posts.find({ "_id": req.body._id, "requests.RequestedBy": userres._id }, (error, resp) => {
                    console.log(resp)
                    if (error) {
                        console.log('err', error)
                        res.status(400).json({
                            success: false,
                            msg: `${error}`
                        });
                    } else if (resp.length != 0) {
                        console.log("exists");

                        res.status(200).json({
                            success: false,
                            msg: "exists"
                        });
                    } else {
                        Postmodel.Posts.findByIdAndUpdate(req.body._id, {
                            "$push": {
                                "requests": {
                                    RequestedBy: userres._id,
                                    status: "requested"
                                }
                            }
                        }, (error, postres) => {
                            if (!error) {
                                Postmodel.newuser.findByIdAndUpdate(userres._id, {
                                    "$push": {
                                        "requests": {
                                            post: postres._id,
                                            status: "requested"
                                        }
                                    }
                                }, (error, response) => {
                                    res.status(200).json({
                                        success: true,
                                        msg: "Requested"
                                    });
                                })

                            } else {
                                console.log(error)
                                res.status(400).json({
                                    success: false,
                                    msg: `${error}`
                                });
                            }
                        });
                    }
                })

            });

        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })


    app.post("/StrApi/ApproveRequest", middleware.checkToken, async function (req, res) {
        try {
            var uid = req.decoded.username;
            console.log(req.body._id)
            Postmodel.Posts.findOneAndUpdate({ "requests._id": req.body._id }, { "requests.$.status": "approved" }, (error, response) => {
                if (!error) {
                    res.status(200).json({
                        success: true,
                        msg: response
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        msg: `${error}`
                    });
                }
            });


        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })


    app.post("/StrApi/RejectRequest", middleware.checkToken, async function (req, res) {
        try {
            var uid = req.decoded.username;
            console.log(req.body._id)
            Postmodel.Posts.findOneAndUpdate({ "requests._id": req.body._id }, { "requests.$.status": "rejected" }, (error, response) => {
                if (!error) {
                    res.status(200).json({
                        success: true,
                        msg: response
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        msg: `${error}`
                    });
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })

    app.post("/StrApi/GetRequests", middleware.checkToken, async function (req, res) {
        try {
            req.body.uid = req.decoded.username;
            // console.log(req.body)
            Postmodel.Posts.findById(req.body._id)
                .populate("requests.RequestedBy", "firstname lastname _id")
                .select("_id requests active CreatedDate name description")
                .exec()
                .then((response, error) => {
                    console.log(response)
                    if (!error) {
                        res.status(200).json({
                            success: true,
                            msg: response
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: `${error}`
                        });
                    }
                })

        } catch (error) {
            res.status(400).json({
                success: false,
                msg: `${error}`
            });
        }

    })

};