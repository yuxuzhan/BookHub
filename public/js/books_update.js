$('#submit').click(function(){
    var formData = new FormData();
    formData.append('file', $('input[type=file]')[0].files[0]);
    formData.append('bookname', $('#bookname').val());
    formData.append('author',$('#author').val());
    formData.append('ISBN', $('#ISBN').val());
    formData.append('courseCode', $('#courseCode').val());
    formData.append('price', $('#price').val());
    formData.append('condition', $('#condition').val());
    formData.append('description', $('#description').val());
    var book_id = $('#book_id').val();
    $.ajax({
        url: '/books/update/' + book_id,
        method: 'PUT',
        data: formData,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false
    }).done(function(data) {
        $(location).attr("href", "/books/" + book_id);
    });
    $(location).attr("href", "/books/" + book_id);
});
