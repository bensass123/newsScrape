// Require mongoose
var mongoose = require("mongoose");






// Create Schema class
var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

//add Comment schema

var commentSchema = new Schema({
  // Just a string
  text: {
    type: String
  }
});

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    unique: true,
    required: true
  },
  // href is a required string
  href: {
    type: String,
    unique: true,
    required: true
  },
  comments: [{
    type: Schema.Types.Mixed,
    ref: "Comment",
    required: true
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
