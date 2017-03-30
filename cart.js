module.exports = function (app, mongoose, Books, Carts) {
    app.post('/cart',function(req, res){
        if(!req.session.userid){
            console.log("requesting add cart denied...user not authenticated...");
            res.sendStatus(401);
        } else {
            var cart = new Carts();
            cart.userid = req.session.userid;
            cart.bookid = req.body.bookid;
            cart.save(function(err, newCart) {
               console.log("successully add book to cart");
           });
        }
    });

    app.get('/cart',function(req, res){
        if(!req.session.userid){
            console.log("requesting cart denied...user not authenticated...");
            res.sendStatus(401);
        } else {
            Carts.find({'userid' : req.session.userid},function (err, carts) {
                console.log("get cart for user: " + req.session.user);
                var ids = [];
                carts.forEach(function(cart){
                    ids.push(cart.bookid);
                });
                Books.find({'_id' : { "$in" : ids}}, function(err,books){
                    res.render('cart.ejs',{userid: req.session.userId, books: books});
                });
            });
        }
    });

    app.delete('/cart:id',function(req, res){
        if(!req.session.userid){
            console.log("requesting delete cart denied...user not authenticated...");
            res.sendStatus(401);
        } else {
            Carts.findOne({'_id' : req.query.id}, function(req,cart){
               if(cart){
                   // remove the cart item with id
                   record.remove();
               }
           });
        }
    });
}
