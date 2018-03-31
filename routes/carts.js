var express = require('express');
var router = express.Router();
var passport = require('passport');
var collectionGlobal;
/*
  GET userlist.
 */



router.get('/', function(req, res) {
  // if(req.user){
  //
  // }
  getSessionCart(req, function(){

    res.json(req.session.cart);
  });

});
// this is for cart page.
router.get('/detail', function(req, res) {
  // if(req.user){
  //
  // }
  getSessionCart(req, function(){
    calculate(req, req.session.cart, true, function(detailCart){
      console.log("calback of calculate from detail");
      res.json(detailCart);

    });
    // res.json(req.session.cart);
  });

});

function getSessionCart(req, next){
  if(req.session.cart){
    console.log("Cart found in session");
    next();
  }
  else{
    console.error("session cart not found");
    req.session.cart = {
      entries : [],
      total : 0,
      user : null,
      createdts : new Date()
    }
    var db = req.db;
    var collection = db.get('carts');
    collectionGlobal = collection;
    collection.insert(req.session.cart)
      .then((doc) =>{
        console.log('req.session.cart + %j, %j', req.session.cart, doc);
        next();
        //return req.session.cart;
      })
    .catch((err) => {console.log(err);}
  );
}

}

router.get('/add/:productId', function(req, res) {
    var db = req.db;

    var collection = db.get('carts');
    getSessionCart(req,function(){
      var productId = req.params.productId;
      var cart = req.session.cart;
      var index = indexOf(productId,cart.entries);
      console.log('found at %s', index );
      if(index > -1){
        cart.entries[index].quantity++;
      }else{
        cart.entries.push({productId : productId, quantity : 1 });
      }
      calculate(req, cart, false, function(){
        console.log("calback of calculate");
        collection.update({_id : cart._id}, cart)
          .then((doc) =>{
            console.log('added to cart + %j, %j', req.session.cart, cart);
            req.session.cart = cart;
            res.json(cart);
          })
        .catch((err) => {console.log(err);}
        );
      });

    });
});

router.get('/update/:productId/quantity/:quantity', function(req, res) {
    var db = req.db;

    var collection = db.get('carts');
    getSessionCart(req,function(){
      var productId = req.params.productId;
      var quantity = parseInt(req.params.quantity);
      console.log('productid = %s, quantity =%s', productId, quantity);
      var cart = req.session.cart;
      var index = indexOf(productId,cart.entries);
      console.log('found at %s', index );
      if(quantity > 0){
        if(index > -1){
          cart.entries[index].quantity= quantity;
        }else{
          //not reachable code from addToCart copy.
          cart.entries.push({productId : productId, quantity : 1* quantity });
        }
      }
      else{
        cart.entries.splice(index, 1);
      }
      calculate(req, cart, true, function(detailedCart){
        console.log("calback of calculate");
        collection.update({_id : cart._id}, cart)
          .then((doc) =>{
            console.log('added to cart + %j, %j', req.session.cart, cart);
            req.session.cart = cart;
            res.json(detailedCart);
          })
        .catch((err) => {console.log(err);}
        );
      });

    });
});

indexOf = function(id, items) {
  var i = 0;
  var len = items.length;
  for (i = 0; i < len; i++) {
    if (id === items[i].productId) {
      console.log('found item %s', id );
      return i;
    }
  }
  return -1;
}

calculate = function(req, cart, detail, next){
  var db = req.db;
  cart.total = 0;
  var collectionCarts = db.get('carts');
  var collectionProducts = db.get('products');
  var consumed = 0;
  for(var i = 0; i < cart.entries.length; i++){
    var entry =cart.entries[i];
    collectionProducts.findOne({productId: 1 * entry.productId},{},function(e,doc){
          console.log('adding product'+doc.productId+ 'quantity ='+'quantity'+doc.price);
          cart.total += doc.price *  cart.entries[consumed].quantity;
          if(detail == true){
            cart.entries[consumed].product = doc;
          }
          consumed+=1;
          console.log("currently consumed = %s, and exists = %s", consumed, cart.entries.length );
          console.log("calculated cart %s", cart.total);
          if(consumed == (cart.entries.length)){
            // return cart;
            console.log("calculated cart %s", cart.total);
            if(detail == true){
              console.log('calling detail cart callback with products');
              next(cart);
            }else{
              console.log('calling cart callback without products');
              next();
            }
          }
    });

  }

}

module.exports = router;
