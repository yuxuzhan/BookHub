var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();
var multer = require('multer');
var upload = multer({ dest: './public/uploads' });
var isbn = require('./isbn');

var autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost/database');
autoIncrement.initialize(connection);
var Users = require('./models/user')(mongoose, autoIncrement, connection);
var Books = require("./models/book")(mongoose, autoIncrement, connection);
var Reviews = require("./models/review")(mongoose);
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

// Users endpoints
require('./user.js')(app, mongoose, Users, Reviews, Books, upload, fs);
// Menus endpoints
require('./book.js')(app, mongoose, Users, Reviews, Books, upload, fs, isbn);
//Review endpoints
require('./review.js')(app, mongoose, Reviews, Users);

app.get('/',function(req, res,next){
    console.log('requesting home page');
    res.render('index.ejs',{userid: req.session.userId});
});

app.get('/search',function(req, res){
    var keywords = req.query['keywords'].split(" ");
    var query = [];
    var condition = parseInt(req.query['condition']);
    var price = parseFloat(req.query['price']);
    if(price === 0){
        keywords.forEach(function (keyword) {
            var l = {'booktitle' : { $regex: keyword, $options: 'i' } , 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
        keywords.forEach(function(keyword){
            var l = {'courseCode' : { $regex: keyword, $options: 'i' } , 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
        keywords.forEach(function(keyword){
            var l = {'ISBN' : { $regex: keyword, $options: 'i' } , 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
    } else {
        keywords.forEach(function(keyword){
            var l = {'booktitle' : { $regex: keyword, $options: 'i' } , 'price' : { $lt: price}, 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
        keywords.forEach(function(keyword){
            var l = {'courseCode' : { $regex: keyword, $options: 'i' } , 'price' : { $lt: price}, 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
        keywords.forEach(function(keyword){
            var l = {'ISBN' : { $regex: keyword, $options: 'i' } , 'price' : { $lt: price}, 'condition' : { $gt: condition}, 'sold':false};
            query.push(l);
        });
    }
    Books.find({$or: query}, function (err, books) {
        if (!books){
            //user (email) already exist
            console.log('book not exist');
            res.sendStatus(403);
        } else {
            console.log("search books for: " + req.query);
            res.render('result.ejs',{userid: req.session.userId, books: books});

        }
    });
});

/*page not found error 404*/
app.get('*', function(req, res){
  res.render("404.ejs",{userid: ""});
});
var server = app.listen(3000, function() {
  console.log('Running on 127.0.0.1:%s', server.address().port);
});
