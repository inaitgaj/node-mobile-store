var passport = require('passport');
var passportLocal = require('passport-local').Strategy;

module.exports = function(app, db){
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done){
    // console.log("serializeUser called - %j", user );

    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    //for now complete user is seralized and deserialized, later it will be id based.
    // console.log("deserializeUser called - %j", user );
    done(null, user);
});
  // passport.deserializeUser(function(user, done){
  //   console.log("deserializeUser called - %j", user );
  //   done(null, user);
  // });
  //Local Strategy
  passport.use(new passportLocal(
    {
      usernameField : 'username',
      passwordField : 'password'
    },
    function(username, password, done){
      // var user= {
      //   username : username,
      //   password : password
      // };
      console.log(username + password);
      var collection = db.get('users');
      collection.findOne({"username": username },{},function(e,doc){
        if(doc !== null){
          if(doc.password === password){
          console.log('Login was successful');
          done(null, doc);
          }
          else{
            done('Bad Password', null);
          }
          }
          else{
            done('User not found', null);
          }
      });

    }
  ));
};
