var express = require('express');
var router = express.Router();

// GET users listing. */
router.get('/', function(req, res) {
  res.send('Hello from NodeJS');
});
router.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
      res.send(err);
    } else {
      console.log('successful logout');
      res.send(true);
    }
  });

});
module.exports = router;
