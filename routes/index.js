var express = require('express');
var cheerio = require("cheerio");
var rp = require('request-promise');
var path = require('path');
var request = require("request");
var router = express.Router();

var Article = require("../models/Article.js");
var Comment = require("../models/Comment.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '/../views/index.html'));
});

router.post('/addcomment', (req, res) => {
  var comment = req.body.comment;
  var href = req.body.href;

  var comment = new Comment(req.body);
  console.log(req.body);

  comment.save(function(error, doc){
    if (error){
      console.log(error);
    } else {
      Article.findOneAndUpdate({"href": href}, {"comment":doc._id}).exec(function(error, doc){
        if(error){
          console.log(error);
        } else {
          res.send(doc);
        }
      });
    }
  });
})

router.get("/articles", function(req, res) {
    // Using query builder
  Article.find({}).populate("comment").exec((error, docs) => {
      if(error){
        console.log(error);
      } else {
        res.send(docs);
      }
    });
});

  // Article.
  //   find({},(err,docs) => {
  //     if (err) {console.log(err)}
  //     else (res.json(docs));
  //   });


router.get("/scrape", function(req, res) {
	
  // url to scrape
  var url = 'http://www.charlotteobserver.com/opinion/editorials/';


	console.log('scrape articles');
  var articleData = [];
  var title, href;


  rp(url).then(function (html) {
	  var $ = cheerio.load(html);
    var h4title = $('.title');
    var imgs = $('.media-object.adaptive.placeholder');
    // log results, images
    // for (var i = 0; i < imgs.length; i++) {
    //   try {
        
    //     pic = imgs[i].attribs['data-src-template'].replace('BINARY/thumbnail','alternates/LANDSCAPE_320');
    //     console.log(pic)
    //   }
    //   catch(e){
    //     console.log(e);
    //   }
    //   imgData.push(pic);
    // }
    // title and link
    for (var i = 0; i < h4title.length; i++) {
      try {
        // article title (need to trim)
        // console.log('------------------');
        // console.log(h4title[i].children[1].children[0].data.trim()); 
        title = h4title[i].children[1].children[0].data.trim();
        // console.log(h4title[i].children[1].attribs['href']);
        href =  h4title[i].children[1].attribs['href'].trim();
        // console.log('------------------');
        // pic = imgs[i].attribs['data-src-template'].replace('BINARY/thumbnail','alternates/LANDSCAPE_320');
      }
      catch (e) {
        // console.log(e);
      } 
      if (title && href) {
        var obj = {
          title: title,
          href: href,
          comments: []
          // pic: pic
        }
        articleData.push(obj)
      }
    }
    // mongoose function
    for (var i = 0; i < articleData.length; i++) {
      var insertObj = new Article(articleData[i]);
      Article.findOneAndUpdate(
        {href: articleData[i].href, title: articleData[i].title},
        insertObj,
        {upsert: true, runValidators: true},
        (err,doc) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        }
      );
    }
    res.json(articleData);
  });

});




module.exports = router;
