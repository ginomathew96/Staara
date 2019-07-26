
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema = new Schema({
    uid: { type: String, required: true, index: { unique: true } }, firstname: { type: String, required: true },
    lastname: { type: String },
    gender: { type: String }, mobileno: { type: mongoose.Number, required: true }, DOB: { type: Date },
    country: { type: String }, state: { type: String }, city: { type: String },
    zipcode: { type: String }, email: { type: String, $regex: /@mongodb\.com$/ }, Schemtype: { type: String },
    userPreference: Schema.Types.Mixed, userPortfolio: Schema.Types.Mixed

})
module.exports = {
    userSchema: userSchema
};