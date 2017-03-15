var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var Users = require('./models/user');
var app = express();
// Set up to use a session
app.use(session({
  secret: 'super_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
var multer = require('multer');
var upload = multer({ dest: './public/uploads' });

// Set views path, template engine and default layout
app.use(express.static('public'));

// The request body is received on GET or POST.
// This middleware just simplifies things a bit.
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

app.get('/',function(req, res,next){
    if(req.session.userid){
        //user logged in
        res.render('index.ejs',{userid: req.session.userid});
    } else {
        res.render('index.ejs',{userid: ""});
    }
});

app.get('/login',function(req, res){
    console.log("render login page");
    if(req.session.user){
        console.log("user already logined in, redirect to index page");
        res.redirect('/');
    } else {
        res.render('login.ejs',{userid: ""});
    }
});

app.get('/signup',function(req, res){
    if(req.session.userid){
        console.log("user already logined in, redirect to index page");
        res.redirect('/');
    } else {
        res.render('signup.ejs',{userid: ""});
    }
});

app.get('/logout',function(req, res){
    if(!req.session.user){
        console.log("user not logged in, redirect to index page");
        res.redirect('/',{userid: ""});
    } else {
        req.session.destroy(function(err) {
            if (!err) {
                console.log("logout user");
                res.redirect('/');
            }
        });
    }
});

app.get('/profile',function(req, res){
    if(!req.session.userid){
        console.log("user not logged in, redirect to login page");
        res.redirect('/login',{userid: ""});
    } else {
        Users.findOne({'_id' : req.session.userid}, function (err, user) {
            if (!user){
                //user (email) already exist
                console.log('user not exist');
                res.sendStatus(403);
            } else {
                res.render('private_profile.ejs', {userid: req.session.userid, user:user } );
            }
        });
    }
});

app.get('/profile/:id',function(req, res, next){
    console.log("requesting profile page for:" + req.params.id);
    Users.findOne({'_id' : req.params.id}, function (err, user) {
        if (!user){
            //user (email) already exist
            console.log('user not exist');
            res.sendStatus(403);
        } else {
            res.render('profile.ejs', { userid: req.session.userid, user:user } );
        }
    });
});

app.get('/user/update',function(req, res){
    if(req.session.userid){
        Users.findOne({'_id' : req.session.userid}, function (err, user) {
            if (!user){
                //user (email) already exist
                console.log('user not exist');
                res.sendStatus(403);
            } else {
                res.render('edit_profile.ejs', { userid: req.session.userid, user:user } );
            }
        });
    } else {
        res.redirect('/');
    }

});

// Getting the value from a form input:
app.post('/signup', upload.single('file'), function(req, res) {
    console.log("registering user");
    //check if user is already existed in db
    Users.find({'email' : req.body.email}, function (err, records) {
        console.log("checking if user already exists");
        if (records.length > 0){
            //user (email) already exist
            console.log('user exists: ' + req.body.email);
            res.sendStatus(403);
        } else {
            console.log("user does not exist, registering user: " + req.body.email);
            var user = new Users();
            var filename;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.password = user.generateHash(req.body.password);
            user.name = req.body.name;
            var filename = '/img/default_avatar.png';
            if(req.file){
                filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
                fs.rename(req.file.path, 'public' + filename, function(err){
                    if(err) throw err;
                });
            }
            user.image.data = filename.toString("binary");
            user.image.contentType = "image/png";
            user.save(function(err, newUser) {
               if (err){
                   console.log("error occured when registering user");
                   throw err;
               } else {
                   console.log("successully registered user: " + req.body.email);

                   req.session.user = newUser.name;
                   req.session.userid = newUser.id;
                   res.redirect('/profile');
               }
           });
        }
    });
});

app.post('/login', function(req, res) {
    console.log("login user");
    //check if user is already existed in db
    Users.findOne({'email' : req.body.email}, function (err, record) {
        if (err){
            console.log('error occured when accessing db');
            res.sendStatus(403);
        } else {
            console.log("checking if user already exists");
            if (record.length == 0){
                //user (email) already exist
                console.log('user does not exists: ' + req.body.email);
                res.sendStatus(403);
            } else {
                console.log("login user: " + req.body.email);
                if (record.validPassword(req.body.password)){
                    //validation successful
                    console.log("successully logined user: " + req.body.email);
                    req.session.user = record.name;
                    req.session.userid = record.id;
                    res.redirect('/');

                } else {
                    //validation failed
                    console.log("failed logined user: " + req.body.email + ' incorrect password');
                    res.send("login failed! incorrect passowrd");
                }
            }
        }
    });
});

app.post('/user/update',upload.single('file'),function(req, res){
    console.log("update user");
    if(req.session.userid){
        Users.findOne({'_id' : req.session.userid}, function (err, user) {
            user.phone = req.body.phone;
            user.name = req.body.name;
            if(req.file){
                var filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
                fs.rename(req.file.path, 'public' + filename, function(err){
                    if(err) throw err;
                });
                user.image.data = filename.toString("binary");
                user.image.contentType = "image/png";
            }
            if(req.body.password)
                user.password = user.generateHash(req.body.password);
            user.save(function(err, newUser) {
               if (err){
                   console.log("error occured when update user");
                   throw err;
               } else {
                   console.log("successully updated user: " + req.body.email);
                   req.session.user = newUser.name;
                   req.session.userid = newUser.id;
                   res.redirect('/profile');
               }
           });
       });
    } else {
        res.redirect('/');
    }
});

var server = app.listen(3000, function() {
  console.log('Running on 127.0.0.1:%s', server.address().port);
});
