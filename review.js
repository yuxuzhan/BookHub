module.exports = function (app, mongoose, Reviews, Users) {
    //post a review for userId = id
    app.post('/review/:id',function(req, res){
        console.log("posting review...");
        var seller = req.params.id;
        if(req.session.user && req.session.userId != req.params.id){
            buyer = req.session.user;
            var rate = parseInt(req.body.rate);
            var review = new Reviews();
            review.seller = seller;
            review.buyer = buyer;
            review.rate = rate;
            review.review = req.body.review;

            review.save(function(err, newReview) {
               if (err){
                   console.log("error occured when saving review");
                   throw err;
               } else {
                   console.log("successully saved review");
                   res.redirect('/users/' + req.params.id);
               }
            });
        }
    });
}
