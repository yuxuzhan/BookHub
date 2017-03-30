$(document).ready(function(){
    $.ajax({
        url: '/captcha',
        method: 'GET',
        dataType: 'json',
        success:function (data) {
            $("#captcha_cell").append(data.data);
        }
    });
});
