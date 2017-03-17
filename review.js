module.exports = function (app, mongoose, Reviews, Users) {

app.post('/review/:id',function(req, res){
    var seller = req.params.id;
    var buyer = "Anonymous";
    if(req.session.user){
        buyer = req.session.user;
    }
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
           res.redirect('/users/' + user.userId);
       }
    });
});

}
