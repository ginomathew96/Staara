

var mongoose = require('mongoose');
var validate = require("validator")

var Schema = mongoose.Schema;
var user = new Schema({
    uid: { type: String, required: true, index: { unique: true } }, firstname: { type: String, required: true },
    lastname: { type: String },
    gender: { type: String }, mobileno: { type: String, required: true }, DOB: { type: Date },
    country: { type: String }, state: { type: String }, city: { type: String },
    zipcode: { type: String }, email: { type: String, validate: [validate.isEmail, 'invalid email'] }, Schemtype: { type: String },
    userPreference: Schema.Types.Mixed, userPortfolio: Schema.Types.Mixed, Uploads: Schema.Types.Mixed, usertype: { type: String, required: true },
    requests: [{
        CreatedDate: { type: Date, default: Date.now },
        Post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'posts'
        }, status: String
    }]

})
var Posts = new Schema({
    name: { type: String, required: true },
    description: String,
    PostedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }, CreatedDate: { type: Date, default: Date.now }, Industry: Schema.Types.Mixed,
    requests: [{
        RequestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        CreatedDate: { type: Date, default: Date.now }, status: String
    }], active: Boolean
})


module.exports = {
    newuser: mongoose.model("Users", user),
    Posts: mongoose.model("Posts", Posts)
}
