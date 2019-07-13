

var ArtistSchema = require("../schemas/Artist")
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const newuser = mongoose.model("Users", ArtistSchema.userSchema)
module.exports = {
    newuser: newuser
};