var express = require('express');
var router = express.Router();
var passport = require('passport');

/*
  GET userlist.
 */

router.post('/login', passport.authenticate('local',{}), function(req, res) {
    console.log("/login");
  if(req.user){
    console.log("Login - user = %j, cart = %j", req.user, req.session.cart);
    //TODO need to make sure cart is present when loggin in - case, restart server with login page not refreshed.
    if(req.session.cart){
      req.session.cart.user = req.user.username;
      var db = req.db;
      var collection = db.get('carts');
      collection.update({_id : req.session.cart._id}, req.session.cart)
        .then((doc) =>{
          console.log('added to cart + %j', req.session.cart);

          res.json(req.session.cart);
        })
      .catch((err) => {console.log(err);}
      );
      console.log("cart = %j", req.session.cart);
    }

    else{
      res.json(true);
    }
  }
});
router.get('/', function(req, res) {
  if(req.user){
    res.json(req.user.username);
  }
  else{
    res.json(false);
  }
});
router.get('/username/:username', function(req, res) {
    var db = req.db;
    var username = req.params.username
    var collection = db.get('users');
    collection.findOne({"username": username},{},function(e,doc){
        if(doc !== null){
          console.log('username '+ username + ' already exists!');
          res.json(false);
        }
        else {
          console.log('username '+ username + ' doesnt exists!');
          res.json(true);
        }
    });
});
router.post('/signup', function(req, res) {
    var db = req.db;
    var user = req.body.user;
    if(user){
    console.log(user);
    var collection = db.get('users');
    //ensure index on username unique.
    collection.insert(user)
      .then((doc) =>{
      if(doc !== null){
        //TODO req.session.username = username;
        req.login(user, function(){console.log('/signup  passport login'+ req.user)});
        res.json(true);
        }
        else{
          res.json(false);
        }
    })
    .catch((err) => {
    // An error happened while inserting
    console.log(err);
    });
    }
    else{
      res.json(false);
    }

});


module.exports = router;
