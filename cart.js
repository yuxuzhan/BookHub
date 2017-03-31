module.exports = function (app, mongoose, Books, Carts) {
    app.post('/cart',function(req, res){
        console.log("requesting add item to cart");
        if(!req.session.userid){
            console.log("requesting add cart denied...user not authenticated...");
            res.sendStatus(401);
        } else {
            Carts.findOne({'bookid' : req.body.bookid, 'userid' : req.session.userid}, function(err,cart){
                if(cart){
                    res.sendStatus(403);
                } else {
                    var cart = new Carts();
                    cart.userid = req.session.userid;
                    cart.bookid = req.body.bookid;
                    cart.save(function(err, newCart) {
                       console.log("successully add book to cart");
                   });
                }
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
                Books.find({'_id' : { "$in" : ids},'sold' : false}, function(err,books){
                    res.render('cart.ejs',{userid: req.session.userId, books: books});
                });
            });
        }
    });

    app.delete('/cart',function(req, res){
        console.log("delete cart item");
        if(!req.session.userid){
            console.log("requesting delete cart denied...user not authenticated...");
            res.sendStatus(401);
        } else {
            //delete cart single cart item with bookid
            if(req.query.id){
                Carts.findOne({'bookid' : req.query.id, 'userid' : req.session.userid}, function(req,cart){
                   if(cart){
                       cart.remove();
                       res.sendStatus(200);
                   }
               });
           } else {
               Carts.find({'userid' : req.session.userid}, function(req,carts){
                  if(carts.length > 0){
                      carts.forEach(function(cart){
                         cart.remove();
                      });
                      res.sendStatus(200);
                  }
              });
           }
        }
    });
}
