/**
 * Created by Hoang Bao on 4/11/2017.
 */
console.log("zxczxczxczxc");
function showHidePasswordfn() {
    var showHideBtn = $(this);
    var showHideSpan = showHideBtn.children().next();
    var $pwd = showHideBtn.prev('input');

    $(showHideBtn).toggleClass('toggleShowHide');
    showHideSpan.text(showHideBtn.is('.toggleShowHide') ? 'Hide' : 'Show');

    if ($pwd.attr('type') === 'password') {
        $pwd.attr('type', 'text');
    } else {
        $pwd.attr('type', 'password');
    }
}

$('.show').on('click', showHidePasswordfn);


$('.show').keypress(function(e) {
    if (e.which === keyCodes.enter) {
        showHidePasswordfn();
    }
});

var oldpass = document.getElementById("old-pass");
var oldpasscf = document.getElementById("hide-pass");
var password = document.getElementById("password")
    , confirm_password = document.getElementById("confirm_password");

function validatePassword(){
    if(oldpass.value != oldpasscf.value){
        oldpass.setCustomValidity("Mật khẩu cũ không đúng");
    } else {
        oldpass.setCustomValidity('');
    }
    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Mật khẩu không khớp");
    } else {
        confirm_password.setCustomValidity('');
    }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;
