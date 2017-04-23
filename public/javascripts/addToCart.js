/**
 * Created by root on 4/7/17.
 */
function addToCart(productID){
    $.ajax({
        method:'POST',
        url:'addToCart',
        data: {productID:productID},
        success:function (data) {
            $('#cart-amount').text('(' + data + ' sản phẩm' +')');
            $('#successful-add').slideDown();
            setTimeout(function () {
                $('#successful-add').fadeOut();
            },1750);

        }
    })
}
function showCart() {
    $.ajax({
        method:'GET',
        url:'showCart',
        success:function (cartPage) {
            $('#cart-showing-place').html(cartPage);
         $(document).ready(function () {
             $('#screen-cover').fadeIn('fast');
             $('#quick-cart').fadeIn('slow');

             $('#quick-cart').animate({
                 top:'10%',

             },{queue:false})
         })
        }
    }) 
}