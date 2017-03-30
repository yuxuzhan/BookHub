$("#share").jsSocials({
    showCount: false,
    showLabel: true,
    shares: ["facebook","twitter","linkedin","googleplus"]
});

$("#cart_add").click(function() {
    $.ajax({
       url: '/cart',
       method: 'POST',
       data: {'bookid' : $('#cart_bookid').text()},
       statusCode:{
           403: function(){
               alert("You have already added this book to your cart!");
           }
       }
   }).done(function(data) {
        $(location).attr("href", "/cart");
    });
});
