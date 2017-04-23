/**
 * Created by Hoang Bao on 4/11/2017.
 */
function showLogin() {
        $('#log').fadeIn('slow');

        $('#log').animate({
            top:'10%',

        },{queue:false})
}

function close() {
    $('#log').fadeOut('fast');

    $('#log').animate({
        top:'10%',

    },{queue:false})
}
