$('a.sold_book').click(function(e){
    $.ajax({
        url: e.target.id,
        method: 'PUT'
    });
});
