$('.delete_cart').click(function(event) {
   var query = '?id=' + event.target.id;
    $.ajax({
       url: '/cart' + query,
       method: 'DELETE',
   }).done(function(data){
       location.reload();
   });

});

$('.delete_all_cart').click(function(event) {
    $.ajax({
       url: '/cart',
       method: 'DELETE',
   }).done(function(data){
       location.reload();
   });
   location.reload();
});
