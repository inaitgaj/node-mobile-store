var express = require('express');
var router = express.Router();

/*
  GET userlist.
 */
router.get('/', function(req, res) {
    var db = req.db;
    if(req.user){
    console.log("user from req %j", req.user);
    }
    var collection = db.get('products');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});
router.get('/:productId', function(req, res) {
  console.log(req.user);
    var db = req.db;
    var productId = 1 * req.params.productId
    var collection = db.get('products');
    collection.findOne({"productId": productId},{},function(e,doc){
        res.json(doc);
    });
});

router.get('/search/:term', function(req, res) {
  console.log(req.session.username);
    var db = req.db;
    var term =  req.params.term
    var collection = db.get('products');
    collection.find({ $text: { $search: term }},{},function(e,doc){
        res.json(doc);
    });
    //TODO - sort using score..
});

module.exports = router;
