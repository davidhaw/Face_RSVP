var express = require('express');
var path = require('path');
var flash = require('connect-flash');
var session = require("express-session"),
    bodyParser = require("body-parser");
var exphbs = require('express-handlebars');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var sqlite3 = require('sqlite3');
//https://stackoverflow.com/questions/23481817/node-js-passport-autentification-with-sqlite
var db = new sqlite3.Database('./database.sqlite3');
function hashPassword(password, salt) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  hash.update(salt);
  return hash.digest('hex');
}

const User = {
    username: 'admin',
    passwordHash: 'admin',
    id:1

}
passport.use('local-login', new LocalStrategy(function(username, password, done) {
  console.log("working 1");
  db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
    if (!row) return done(null, false);
    //var hash = hashPassword(password, row.salt);
    db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, password, function(err, row) {
      if (!row) return done(null, false);
      return done(null, row);
    });
  });
}));

passport.use('local-signup', new LocalStrategy(function(username, password, done) {
    
    db.run("INSERT INTO users (username, password, salt) VALUES ($username, $password, $salt);", {
        $username: username,
        $password: password,
        $salt: 'ab'
    }, function(){return done(null, false)});
    
}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
    if (!row) return done(null, false);
    return done(null, row);
  });
});


var app = express();

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000;
app.engine('html', exphbs({defaultLayout:'main'}));
app.set('view engine', 'html');
app.get('/account', function (req, res) {
   console.log(req.session.passport.user);
   res.render('account', {
       
       data: {
           
            name: req.session.passport.user.username
           
       }
       
   });
    
});

app.get('/createEvent', function (req, res) {
  //  res.send("test");
   //console.log(req.session.passport.user);
   res.render('createEvent', {
       
     //  data: {
           
           
    //   }
       
   });
    
});
app.use(flash());

module.exports = app;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
/*
app.post('/login', function(req, res, next) {
  console.log("working 2");
  //res.redirect("/index.html");
  passport.authenticate('local-login', function(err, user, info) {
      if ( err ) {
          console.log("not working 1");
          next(err);
          return
      }
      if( ! user ) {
          console.log("not working 2");
          req.flash('error', 'Doesnt Work')
          next(err);
          return
      }
      console.log('working');
      res.redirect('/account?=' + user )
  })
}

  );
*/

app.post('/login', 
    passport.authenticate('local-login', {
                                         failureRedirect: '/signIn.html',
                                         failureFlash: true }), 
    function(req, res) {
        res.redirect('/account')   
}
);

app.post('/signup',
    passport.authenticate('local-signup', { successRedirect: 'account.html',
                                          failureRedirect: 'signup.html',
                                          failureFlash: true})
);