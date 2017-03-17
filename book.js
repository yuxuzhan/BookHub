module.exports = function (app, mongoose, Users, Reviews, Books, upload, fs, isbn) {
    //requesting book updating page
    app.get('/books/update/:id',function(req, res,next){
        console.log("bad request...book update page...");
        Books.findOne({'bookId' : req.params.id}, function (err, book) {
            if (!book){
                console.log('bad input book not exist');
                res.sendStatus(400);
            } else {
                if (book.user === req.session.userid){
                    res.render('update_book.ejs',{userid: req.session.userId, book: book});
                }
                else {
                    console.log("requesting update page denied...user not authenticated...");
                    res.sendStatus(401);
                }
            }
        });
    });

    //update book
    app.put('/books/update/:id',upload.single("file"),function(req, res,next){
        console.log("update books");
        Books.findOne({'bookId' : req.params.id}, function (err, book) {
            if (!book){
                console.log('bad request...book not exist');
                res.sendStatus(400);
            } else {
                book.booktitle = req.body.bookname;
                book.author = req.body.author;
                book.ISBN = req.body.ISBN;
                book.courseCode = req.body.courseCode;
                book.price = req.body.price;
                book.condition = req.body.condition;
                book.description = req.body.description;
                if(req.file){
                    var filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
                    fs.rename(req.file.path, 'public' + filename, function(err){
                        if(err) throw err;
                    });
                    book.image.data = filename.toString("binary");
                    book.image.contentType = "image/png";
                }
                book.save(function(err, newBook) {
                   console.log("successully add book: " + newBook.booktitle);
                   res.contentType('json');
                   res.send({ url : '/books/' + newBook.bookId });
                });
            }
        });
    });

    //update book to be sold
    app.put('/books/sold/:id',function(req, res){
        console.log('update book to be sold...');
        if(!req.session.userid){
            console.log("requesting book update denined...user not authenticated");
            res.sendStatus(401);
        } else {
            Books.findOne({'bookId':req.params.id},function(err,book){
                book.sold = true;
                book.save(function(err, updateBook) {
                   res.redirect('/list');
               });
           });
       }
    });

    //requesting add book page
    app.get('/books',function(req, res,next){
        console.log("requesting add book page...");
        if(req.session.userid){
            //user logged in
            res.render('add_book.ejs',{userid: req.session.userId, error:""});
        } else {
            res.redirect('/login');
        }
    });

    //add book by manual input
    app.post('/books', upload.single('file'), function(req, res) {
        console.log("add books");
        var book = new Books();
        var filename;

        book.booktitle = req.body.bookname;
        book.author = req.body.author;
        book.description = req.body.description;
        book.user = req.session.userid;
        book.ISBN = req.body.ISBN;
        book.courseCode = req.body.courseCode;
        book.condition = req.body.condition;
        book.price = req.body.price;
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
               console.log("error occured when add books by ISBN");
               res.render('add_book.ejs', {userid: req.session.userId,error: 'Book is not added by Manual Input'});
           } else {
               console.log("successully add book: " + newBook.booktitle);
               res.redirect('/books/' + newBook.bookId);
           }
       });
    });

    //add book by ISBN
    app.post('/books/ISBN', upload.single('file'), function(req, res) {
        console.log("add books by ISBN");
        isbn.resolveGoogle(req.body.ISBN_autofill,function(err, data){
            if(err){
                console.log("error occured when add books by ISBN");
                res.render('add_book.ejs', {userid: req.session.userId,error: 'Wrong ISBN, book is not added'});
            }else{
                console.log(data);
                var book = new Books();
                var filename;
                book.user = req.session.userid;
                book.ISBN = req.body.ISBN_autofill;
                book.courseCode = req.body.courseCode_autofill;
                book.condition = req.body.condition_autofill;
                book.price = req.body.price_autofill;
                book.sold = false;
                book.booktitle = data.title;
                var author = "";
                for (var i = 0; i < data.authors.length; i++){
                    author += data.authors[i] + " ";
                }
                book.author = author;
                if(data.description){
                    book.description = data.description;
                }
                if(data.imageLinks.thumbnail){
                    book.image.data = data.imageLinks.thumbnail.toString("binary");
                    book.image.contentType = "image/png";
                }else{
                    var filename = '/img/default_book.png';
                    if(req.file){
                        filename = '/uploads/' + (new Date).valueOf() + '-' + req.file.originalname;
                        fs.rename(req.file.path, 'public' + filename, function(err){
                            if(err) throw err;
                        });
                    }
                    book.image.data = filename.toString("binary");
                    book.image.contentType = "image/png";
                }
                console.log(book.title);
                book.save(function(err, newBook) {
                   if (err){
                       console.log("error occured when add books by ISBN");
                       res.render('add_book.ejs', {userid: req.session.userId,error: 'book is not added by ISBN somehow'});
                   } else {
                       console.log("successully add book: " + newBook.booktitle);
                       res.redirect('/books/' + newBook.bookId);
                   }
               });
            }
        });
    });

    //requesting private book listing page
    app.get('/list',function(req, res){
        console.log("requesting user's listing page...");
        if(req.session.userid){
            Books.find({'user':req.session.userid,'sold':false}, function (err, books_avaliable) {
                Books.find({'user':req.session.userid,'sold':true}, function (err, books_sold) {
                    res.render('mypost.ejs',{userid: req.session.userId,books_avaliable:books_avaliable,books_sold:books_sold});
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    //requesting book page
    app.get('/books/:id',function(req, res){
        console.log("requesting book page...");
        Books.findOne({'bookId' : req.params.id}, function (err, book) {
            if (!book){
                console.log('book not exist...');
                res.sendStatus(401);
            } else {
                Users.findOne({'_id' : book.user}, function (err, seller) {
                    if (Reviews){
                        Reviews.find({'seller': seller.userId},function (err, reviews) {
                            var sum = 0;
                            reviews.forEach(function(review){
                                sum += parseInt(review.rate);
                            });
                            var score = sum/reviews.length;
                            score = score.toFixed(2);
                            res.render('viewbook.ejs', {userid: req.session.userId, book:book, seller:seller, score: score} );
                        });
                    } else {
                        res.render('viewbook.ejs', {userid: req.session.userId, book:book, seller:seller, score: 0} );
                    }
                });
            }
        });
    });

}
