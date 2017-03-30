$('#submit').click(function(){
    if($('#password_1').val() === $('#password_2').val()){
        var formData = new FormData();
        formData.append('file', $('input[type=file]')[0].files[0]);
        formData.append('name', $('#name').val());
        formData.append('password',$('#password_1').val());
        formData.append('phone', $('#phone').val());
        var user_id = $('#user_id').val();
        $.ajax({
            url: '/users/update',
            method: 'PUT',
            data: formData,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function(data) {
                $(location).attr("href", '/users/' + user_id);
            }
        }).done(function(data) {
            $(location).attr("href", '/users/' + user_id);
        });
        $(location).attr("href", '/users/' + user_id);
    } else{
        alert('make sure passwords are same');
        return false;
    }
});
