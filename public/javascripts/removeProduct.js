/**
 * Created by root on 4/9/17.
 */
function removeProduct(productID){
    $.ajax({
        method:'DELETE',
        url:'/removeProduct',
        data: {productID:productID},
        success:function (data) {
          showCart();
          $('#cart-amount').text('(' + data + ' sản phẩm' +')');
        }
    })
}