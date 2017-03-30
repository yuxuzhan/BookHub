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
   }).done(function(data){
       location.reload();
   });

});
