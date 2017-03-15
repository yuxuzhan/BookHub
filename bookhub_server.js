var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var Users = require('./models/user');
var Books = require("./models/book");
var app = express();
var multer = require('multer');
var upload = multer({ dest: './public/uploads' });

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bookhub');

// Set up to use a session
app.use(session({
  secret: 'super_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

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

app.get('/viewbook/:id',function(req, res){
    Books.findOne({'_id' : req.params.id}, function (err, book) {
        if (!book){
            //user (email) already exist
            console.log('book not exist');
            res.sendStatus(403);
        } else {
            Users.findOne({'_id' : book.user}, function (err, seller) {
                res.render('viewbook.ejs', {userid: req.session.userid, book:book, seller:seller} );
            });
        }
    });

});

app.get('/addbook',function(req, res,next){
    if(req.session.userid){
        //user logged in
        res.render('add_book.ejs',{userid: req.session.userid});
    } else {
        res.redirect('/login');
    }
});

app.get('/mypost',function(req, res,next){
    if(req.session.userid){
        Books.find({'user':req.session.userid,'sold':true}, function (err, books_avaliable) {
            console.log(books_avaliable);
            Books.find({'user':req.session.userid,'sold':false}, function (err, books_sold) {
                console.log(books_sold);
                res.render('mypost.ejs',{userid: req.session.userid,books_avaliable:books_avaliable,books_sold:books_sold});
            });

        });
    } else {
        res.redirect('/login');
    }
});

app.get('/updatebook/:id',function(req, res,next){
    Books.findOne({'_id' : req.params.id}, function (err, book) {
        if (!book){
            //user (email) already exist
            console.log('book not exist');
            res.sendStatus(403);
        } else {
            if (book.user === req.session.userid){
                res.render('update_book.ejs',{userid: req.session.userid, book: book});
            }
        }
    });
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

// Getting the value from a form input:
app.post('/addbook', upload.single('file'), function(req, res) {
    console.log("add books");
    var book = new Books();
    var filename;
    book.user = req.session.userid;
    book.booktitle = req.body.bookname;
    book.author = req.body.author;
    book.ISBN = req.body.ISBN;
    book.courseCode = req.body.courseCode;
    book.price = req.body.price;
    book.condition = req.body.condition;
    book.description = req.body.description;
    book.sold = false;
    var filename = '/img/default_book.png';
    if(req.file){
        filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
        fs.rename(req.file.path, 'public' + filename, function(err){
            if(err) throw err;
        });
    }
    book.image.data = filename.toString("binary");
    book.image.contentType = "image/png";
    book.save(function(err, newBook) {
       if (err){
           console.log("error occured when add books");
           throw err;
       } else {
           console.log("successully add book: " + newBook.booktitle);
           res.redirect('/viewbook/' + newBook._id);
       }
   });
});

app.post('/updatebook/:id',upload.single("file"),function(req, res,next){
    Books.findOne({'_id' : req.params.id}, function (err, book) {
        if (!book){
            //user (email) already exist
            console.log('book not exist');
            res.sendStatus(403);
        } else {
            console.log("update books");
            book.booktitle = req.body.bookname;
            book.author = req.body.author;
            book.ISBN = req.body.ISBN;
            book.courseCode = req.body.courseCode;
            book.price = req.body.price;
            book.condition = req.body.condition;
            book.description = req.body.description;
            var filename = '/img/default_book.png';
            if(req.file){
                filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
                fs.rename(req.file.path, 'public' + filename, function(err){
                    if(err) throw err;
                });
            }
            book.image.data = filename.toString("binary");
            book.image.contentType = "image/png";
            book.save(function(err, newBook) {
               if (err){
                   console.log("error occured when update books");
                   throw err;
               } else {
                   console.log("successully add book: " + newBook.booktitle);
                   res.redirect('/viewbook/' + newBook._id);
               }
            });
        }
    });
});

var server = app.listen(3000, function() {
  console.log('Running on 127.0.0.1:%s', server.address().port);
});
