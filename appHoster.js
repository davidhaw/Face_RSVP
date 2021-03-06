var express = require('express');
var path = require('path');
var flash = require('connect-flash');
var session = require("express-session"),
    bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var multer = require('multer');
var mime = require('mime');
var mimeTypes = require ('mime-types');
var mailgun = require("mailgun-js");
var api_key = '306a1da49f5eadabb3281dfd5bc82974-9ce9335e-be97d48f';
var DOMAIN = 'sandboxc59f606b9e144225878ddd0e4d2398ef.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
var fs  = require('fs');
var trainer = require("./faceRecTrainer.js")
var fr = require("face-recognition")
var mkdirp = require('mkdirp');
var filereaderRequired = require('filereader');
var eFileupload = require('express-fileupload');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var CustomStrategy = require('passport-custom').Strategy;
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

var tmp = require('tmp');

passport.use('local-login', new CustomStrategy(function(req, done) {
  console.log("working 1");
  db.get('SELECT salt FROM users WHERE username = ?', req.body.username, function(err, row) {
    if (!row) return done(null, false);
    //var hash = hashPassword(password, row.salt);
    db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', req.body.username, req.body.password, function(err, row) {
      if (!row) return done(null, false);
      return done(null, row);
    });
  });
}));

passport.use('local-signup', new CustomStrategy(function(req, done) {

    db.run("INSERT INTO users (username, password, salt, email) VALUES ($username, $password, $salt, $email);", {
        $username: req.body.username,
        $password: req.body.password,
        $salt: 'ab',
        $email: req.body.email
    }, function(){return done(null, true)});

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
app.use(eFileupload());
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

app.get('/upload', function (req, res) {
  //  res.send("test");
   //console.log(req.session.passport.user);
   res.render('upload', {

     //  data: {


    //   }

   });

});


app.get('/eventLive/:code', function (req, res) {
  //  res.send("test");
   //console.log(req.session.passport.user);
   res.render('eventLive', {

     //  data: {


    //   }

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

app.get('/event/:code', function (req, res) {

    db.each("SELECT * FROM events where code=\"" + req.params.code + "\"", function(err, row) {

        var data = row;
        console.log(row);
      res.render('event', {

            data: data


        });

    });
});
app.use(flash());

module.exports = app;

app.listen(port, () => console.log(`Face RSVP app listening on port ${port}!`))
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

app.post('/createEvent', function (req, res) {

  db.run("INSERT INTO events (date, creator, location, name, code) VALUES ($date, $creator, $location, $name, $code);", {
      $date: req.body.date,
      $creator: 'to-do',
      $location: 'to-do',
      $name: req.body.eventName,
      $code: req.body.eventCode,
    }
);
    res.redirect('/event/' + req.body.eventCode);
});

app.post('/joinEvent',  function (req, res) {

    res.redirect('/event/' + req.body.eventCode);

});

app.post('/eventLiveRed', function (req, res) {

    res.redirect('/eventLive/' + req.body.eventLiveCode);

});

app.post('/RSVP', function (req, res) {

    console.log("USER" + req.session.passport.user);
    console.log("EVENT CODE" + req.body.eventCode);
   /* db.get("SELECT email FROM users WHERE username = ?",  req.session.passport.user.username, function (err, row){
        console.log(row);
        mailgun.messages().send(
            {
                from: 'Mailgun Sandbox <postmaster@sandboxc59f606b9e144225878ddd0e4d298ef.mailgun.org>',
                to: req.session.passport.user.username + ' ' + "<" + row.email.replace(/(\r\n|\n|\r)/gm, "") + ">"
,
                subject: 'Hello' +  req.session.passport.user.username,
                text: 'Congratulations' +   req.session.passport.user.username +', you RSVPD for Blank!'
            }, function (error, body) {
                    console.log(body);
                })
    }) */
    console.log("Getting Here");
    db.each("SELECT * FROM events where code=\"" + "test" + "\"", function(err, row) {
        console.log("ROW: " + row.id);
        db.run("INSERT INTO rsvp (recipients, event) VALUES ($recipients, $event);", {
        $recipients: req.session.passport.user.id,
        $event: row.id,
        }); 
    });
    res.redirect('/event/' + req.body.eventCode);
});


// https://github.com/richardgirges/express-fileupload/tree/master/example#basic-file-upload
//Uploading multiple files
app.post('/upload'), function(req,res) {
  res.send("OKAY!");
  /**
  console.log(req);
  const files = req.files
  console.log("Training Faces")
  console.log(files);
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

  //Express File Ulpoad (Currently transitioning from multr to this)
  var fileUpload = req.files.myFiles;
  fileUpload.mv('upload/epic/epicUpload.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });

  var filepaths = [];
  files.forEach( function (file) {
 
    filepaths.push(file.path);

  });
   console.log(filepaths);

    // Once files are uploaded from server, they imeadietly get scanned to  get the faces and then that info is put into that user's json file.
    // JSON file is afterwards used to check if the person is allowed to event
    const recognizer = fr.FaceRecognizer();
    var loadedImages = trainer.loadImages(filepaths);
    var detectedFaceImages = trainer.detectFaces(loadedImages);
    console.log("Detecting Data");
    console.log(detectedFaceImages);
     
    trainer.addFacesToRecognizer(recognizer, detectedFaceImages, req.session.passport.user.id);
    var UserjsonPath = "./models/" + req.session.passport.user.id + '/';
    if (!fs.existsSync(UserjsonPath)) {
      console.log("Please make the DIR")
      mkdirp(UserjsonPath, function (err) {
        if (err) console.error(err);
        else console.log("No mkdirp issues!");
        
      });
    }
    trainer.saveJSON(recognizer, UserjsonPath);

    console.log("Finished Training and saved to json model");


  res.send(files)
   /* for files
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
*/ 
};

app.post('/checkFace', function (req, res) {

  var recipients = getRecipients(1);

  console.log("Recipients", recipients);
  console.log("Req Files", req.files);
  
  fs.writeFileSync("/var/tmp/test.jpg", req.files['myNonMultrFiles']['data']);


  recipients.then(function(recipients) {

    const recognizer = fr.FaceRecognizer();
    console.log("All Recipients:", recipients);
    recipients.forEach(function(recipient) {
      console.log("Recipient", recipient);
      var pathrecipient = "./models/" + recipient + '/model.json';
      const modelState = require(pathrecipient)
      recognizer.load(modelState)
      

    /*  var reader = new filereaderRequired();
      reader.readAsDataURL(req.files); 
      reader.onloadend = function() {
        base64data = reader.result;                
        console.log(base64data);
        var base64Image = base64data;
      }
        */
      const bestPrediction = recognizer.predictBest(fr.loadImage("/var/tmp/test.jpg"));
      console.log(bestPrediction);

    });

  });


});

function getRecipients(eventID) {

  return new Promise(function (resolve, reject) {

    var recipients = db.all("SELECT id, recipients, event FROM rsvp", function (err, rows) {
      if (err){
        reject(err);
      }
      let recp = rows.map(function (row) {
  
        if (row.event == eventID) {
  
          console.log(row);
          return(row.recipients);
          
        }

        else {
          
          return null;

        }
  
      });
      console.log(recp);
      resolve(recp);
    });  

  });

}