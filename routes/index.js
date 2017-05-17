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

router.post('/delcomment', (req, res) => {
  var text = req.body.text;
  var href = req.body.href;
  console.log(req.body)


  Article.findOneAndUpdate({href: href}, {$pull: {comments: {text: text}}}, function(err, doc) {
    if (err){
      console.log('comment delete error')
      console.log(err);
    }
    else {
      console.log(doc);
    }
  })
})

router.post('/addcomment', (req, res) => {
  console.log(req.body);
  var text = req.body.comment;
  var href = req.body.href;

  var comment = new Comment({text: text, href: href});
  console.log(comment);
  

  //save comment to associated article

  Article.findOneAndUpdate({"href": href}, {$addToSet: {comments: comment}}, function(error, doc1) {
        if(error){
          console.log(error);
        } else {
          console.log(doc1);
          Comment.findOneAndUpdate({'text': text}, comment, {upsert: true}, function(error, doc2) {
              if(error){
                console.log(error);
              } else {
                console.log(doc2);
                res.send(doc2);
              }
          });
        }
  })
})
  

  // comment.save(function(error, doc){
  //   if (error){
  //     console.log(error);
  //   } else {
  //     Article.findOneAndUpdate({"href": href}, {$push: {comments: comment}}).exec(function(error, doc){
  //       if(error){
  //         console.log(error);
  //       } else {
  //         res.send(doc);
  //       }
  //     });
  //   }
  // });


router.get("/articles", function(req, res) {
  // Article.find({}).exec((error, docs) => {
  //   if(error) {
  //       console.log(error);
  //     } 
  //     else {
  //       res.send(docs);
  //     }
  // });

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
    // end for loop

    var bulk = Article.collection.initializeUnorderedBulkOp();

    console.log('article data length: ' + articleData.length);

    for (var i=0; i <articleData.length; i++){
      let a = articleData[i];
      bulk.find({href: a.href}, 'title href').upsert({}).update({$set: {
        title: a.title,
        href: a.href
      }});
    }

    bulk.execute((err, docs)=>{
      if (err) {
        console.log(err);
      }
      else {
        console.log('SUCCESS');
        console.log(docs);
        res.json(articleData);
      }
    })


    // Article.updateMany(
    //   {},  //updates all docs
    //   $set {}
    // )



  });
});

    // do it the bulk way

    // Article.updateMany({},articleData,{upsert:true})
    //   .then(function(docs) {
    //       console.log(docs);
    //   })
    //   .catch(function(err) {
    //       console.log(err);
    //   });



  //   // mongoose function
  //   for (var i = 0; i < articleData.length; i++) {
  //     let insertObj = new Article(articleData[i]);
  //     let href = articleData[i].href;
  //     let title = articleData[i].title;
  //     Article.findOneAndUpdate(
  //       {href: href, title: title},
  //       insertObj,
  //       {upsert: true, new: true},
  //       (err,doc) => {
  //         if (err) {
  //           console.log('article insert function -----------------------------------------------------------------------xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-------------------------')
  //           console.log(err);
  //         }
  //         else {
  //           console.log(doc);
  //         }
  //       }
  //     );
  //   }
  //   res.json(articleData);
  // });






module.exports = router;
