module.exports = function (app, mongoose, Users, Reviews, Books, upload, fs) {
    //get registeration page
    app.get('/users',function(req, res){
        console.log("requesting signup page...");
        if(req.session.userid){
            console.log("user already logined in, redirect to index page");
            res.redirect('/');
        } else {
            res.render('signup.ejs',{userid: "", error: ""});
        }
    });

    // Create user
    app.post('/users', upload.single('file'), function (req, res) {
       console.log("register user");
      // Validation, if any of email, name password is empty, error code: 400
      if (!req.body.email || !req.body.name || !req.body.password)
          return res.sendStatus(400);
      //check if user is already existed in db
      Users.find({'email' : req.body.email}, function (err, records) {
          console.log("checking if user already exists");
          if (records){
              //user (email) already exist
              console.log('user exists: ' + req.body.email);
              res.render('signup.ejs',{userid: "", error: 'user exists: ' + req.body.email});
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
                 console.log("successully registered user: " + req.body.name);
                 req.session.user = newUser.name;
                 req.session.userid = newUser._id;
                 req.session.userId = newUser.userId;
                 res.redirect('/users/' + newUser.userId + '/private');
            });
          }
      });
    });

    //get update user page
    app.get('/users/update',function(req, res){
        console.log("requesting user update page...");
        if(req.session.userid){
            Users.findOne({'_id' : req.session.userid}, function (err, user) {
                if (!user){
                    console.log('user not exist...');
                    res.sendStatus(401);
                } else {
                    res.render('edit_profile.ejs', { userid: req.session.userId, user:user});
                }
            });
        } else {
            console.log("user not authenticated...")
            res.sendStatus(401);
        }
    });

    // Update user
    app.put('/users/update', upload.single('file'), function (req, res) {
        console.log("update user...");
        if (!req.session.userid) {
            console.log("requesting private profile error: user not authenticated...");
            res.sendStatus(401);
        } else {
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
                user.save(function(err, record) {
                   console.log("successully updated user: " + req.body.name);
                   req.session.user = record.name;
                   req.session.userid = record._id;
                   req.session.userId = record.userId;
                   res.contentType('json');
                   res.send({ url : '/users/' + record.userId + '/private' });
               });
           });
        }
    });

    // Get user's name, status and likes
    app.get('/users/:id', function (req, res) {
        console.log("requesting profile page for:" + req.params.id);
        Users.findOne({'userId' : req.params.id}, function (err, user) {
            if (!user){
                console.log("requesting profile page error: user does not exist...");
                res.sendStatus(401);
            } else {
                if (Reviews){
                    Reviews.find({'seller':user.userId},function (err, reviews) {
                        var sum = 0;
                        reviews.forEach(function(review){
                            sum += parseInt(review.rate);
                        });
                        var score = sum/reviews.length;
                        score = score.toFixed(2);
                        Books.find({'user':user.userId,'sold':false}, function(err, books){
                            res.render('profile.ejs', { userid: req.session.userId, user:user, reviews: reviews, score: score, books: books});
                        });
                    });
                } else {
                    Books.find({'user':user._id,'sold':false}, function(err, books){
                        res.render('profile.ejs', { userid: req.session.userId, user:user, reviews: "", score: 0, books: books});
                    });
                }
            }
        });
    });

    //get private profile page
    app.get('/users/:id/private', function (req, res) {
        console.log("requesting private profile");
        if (req.session.userId != req.params.id){
            console.log("requesting private profile error: user not authenticated...");
            return res.sendStatus(401);
        }else{
            Users.findOne({'userId' : req.params.id}, function (err, user) {
                if (!user){
                    console.log("requesting private profile page error: user does not exist...");
                    res.sendStatus(401);
                } else {
                    res.render('private_profile.ejs', {userid: req.params.id, user:user});
                }
            });
        }
    });

    //get login page
    app.get('/login',function(req, res){
        console.log("requesting login page...");
        if(req.session.userid){
            console.log("user already logined in, redirect to index page");
            res.redirect('/');
        } else {
            res.render('login.ejs',{userid: "", error:""});
        }
    });

    // Log in
    app.post('/login', function (req, res) {
        console.log("login user...")
        if (!req.body.email || !req.body.password)
          return res.sendStatus(400);

        Users.findOne({'email' : req.body.email}, function (err, record) {
          if (!record){
              console.log('user does not exists: ' + req.body.email);
              res.render('login.ejs',{userid: "", error:'user does not exists: ' + req.body.email});
          } else {
              if (record.validPassword(req.body.password)){
                  //validation successful
                  console.log("successully logined user: " + req.body.email);
                  req.session.user = record.name;
                  req.session.userid = record._id;
                  req.session.userId = record.userId;
                  res.redirect('/users/' + record.userId + '/private');
              } else {
                  //validation failed
                  console.log("failed logined user: " + req.body.email + ' incorrect password');
                  res.render('login.ejs',{userid: "", error:"failed logined user: " + req.body.email + ' incorrect password'});
              }
          }
        });
    });

    //logout
    app.get('/logout',function(req, res){
        console.log("logout user");
        if(!req.session.userid){
            console.log("user not logged in, redirect to index page");
            res.sendStatus(401);
        } else {
            req.session.destroy(function(err) {
                if (!err) {
                    console.log("logout user");
                    res.redirect('/');
                }
            });
        }
    });
}
