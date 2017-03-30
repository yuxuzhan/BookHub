$('.delete_cart').click(function(event) {
   var query = '?id=' + event.target.id;
    $.ajax({
       url: '/cart' + query,
       method: 'DELETE',
   }).done(function(data){
       location.reload();
   });

});
