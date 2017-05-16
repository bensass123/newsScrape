// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Comment schema
var commentSchema = new Schema({
  // Just a string
  text: {
    type: String,
    required: true,
    unique: true
  },
  href: {
    type: String,
    required: true,
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the Comments
// These ids are referred to in the Article model

// Create the Comment model with the commentSchema
var Comment = mongoose.model("Comment", commentSchema);

// Export the Comment model
module.exports = Comment;
