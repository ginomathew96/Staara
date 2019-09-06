

var ArtistSchema = require("../schemas/Artist")
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newuser = mongoose.model("Users", ArtistSchema.userSchema)
var Posts = mongoose.model("Posts", ArtistSchema.Posts)
module.exports = {
    newuser: newuser,
    Posts: Posts
}
