$('form').submit(function () {

    if($('#password_1').val() === $('#password_2').val()){
        return true;
    } else{
        alert('make sure passwords are same');
        return false;
    }
});
