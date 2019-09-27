

var mongoose = require('mongoose');
var validate = require("validator")

var Schema = mongoose.Schema;
var user = new Schema({
    uid: { type: String, required: true, index: { unique: true } },
    firstname: { type: String, required: true },
    lastname: { type: String },
    gender: { type: String },
    mobileno: { type: String, required: true },
    DOB: { type: Date },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipcode: { type: String },
    email: {
        type: String,
        validate: [validate.isEmail, 'invalid email']
    },
    Schemtype: { type: String },
    userPreference: Schema.Types.Mixed,
    userPortfolio: Schema.Types.Mixed,
    Uploads: Schema.Types.Mixed,
    usertype: { type: String, required: true },
    requests: [{
        CreatedDate: { type: Date, default: Date.now },
        Post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'posts'
        }, status: String,
        userShema: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plans'
        }
    }]

})
var Posts = new Schema({
    name: { type: String, required: true },
    description: String,
    PostedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    CreatedDate: { type: Date, default: Date.now },
    requests: [{
        RequestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        CreatedDate: { type: Date, default: Date.now },
        status: String
    }],
    location: { type: String, required: true },
    industry: { type: String, required: true },
    gender: { type: String, required: true },
    characterDetails: { type: String },
    ageStart: { type: String, required: true },
    ageEnd: { type: String, required: true },
    startDate: { type: Date, required: true },
    active: Boolean
})

var plans = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    dailyLimit: { type: Number, required: true }
})

// module.exports = {
//     userSchema: userSchema
// };



module.exports = {
    newuser: mongoose.model("Users", user),
    Posts: mongoose.model("Posts", Posts),
    plans: mongoose.model("Plans", plans)
}
