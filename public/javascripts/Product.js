/**
 * Created by root on 3/15/17.
 */


function showNextProduct(ProductArray,currentIndex) {
    for(var j =0;j< InScreenProduct;j++){
        $(ProductArray[currentIndex.i]).fadeOut(400);
        if(currentIndex.i == ProductArray.length-1)
        {
            currentIndex.i =0;
        }
        else{

            currentIndex.i+=1;
        }
    }
    setTimeout(function(){
        for (var j = 0;j<InScreenProduct;j++){
            $(ProductArray[currentIndex.i+ j ]).fadeIn();
        }

        $(window).trigger('resize');
    },400)
}
function showPrevProduct(ProductArray,currentIndex) {
    for(var j =0;j< InScreenProduct;j++){
        if(currentIndex.i == 0)
        {
            currentIndex.i =0;
        }
        else{
            currentIndex.i-=1;
            $(ProductArray[currentIndex.i  + InScreenProduct]).fadeOut(400);
        }
    }



    setTimeout(function(){
        for (var j = 0;j<InScreenProduct;j++){
            $(ProductArray[currentIndex.i +  j ]).fadeIn();
        }

        $(window).trigger('resize');
    },400)
}

$(document).ready(function () {


    $(window).resize(function () {
        var widthpx = $('.product-showing-place').css('width');
        var width  = widthpx.slice(0,widthpx.search('px'));
        var width = parseInt(width);

        if(width <= 740 && width >550)
        {
            $('.product').removeClass('col-xs-3').addClass('col-xs-4');
            $(fsp[fsi.i+3]).css('display','none');
            $(fsp[fsi.i+2]).css('display','block');
            $(fsp[fsi.i+1]).css('display','block');
            $(sndp[sndi.i+3]).css('display','none');
            $(sndp[sndi.i+2]).css('display','block');
            $(sndp[sndi.i+1]).css('display','block');
            $(thrdp[thrdi.i+3]).css('display','none');
            $(thrdp[thrdi.i+2]).css('display','block');
            $(thrdp[thrdi.i+1]).css('display','block');
            InScreenProduct = 3;
        }
        else if(width <= 550 && width> 365)
        {
            $('.product').removeClass('col-xs-4').removeClass('col-xs-3').addClass('col-xs-6');
            $(fsp[fsi.i+3]).css('display','none');
            $(fsp[fsi.i+2]).css('display','none');
            $(fsp[fsi.i+1]).css('display','block');
            $(sndp[sndi.i+3]).css('display','none');
            $(sndp[sndi.i+2]).css('display','none');
            $(sndp[sndi.i+1]).css('display','block');
            $(thrdp[thrdi.i+3]).css('display','none');
            $(thrdp[thrdi.i+2]).css('display','none');
            $(thrdp[thrdi.i+1]).css('display','block');
            InScreenProduct = 2;
        }
        else if (width <= 365)

        {
            $('.product').removeClass('col-xs-4').removeClass('col-xs-6').addClass('col-xs-12');
            $(fsp[fsi.i+3]).css('display','none');
            $(fsp[fsi.i+2]).css('display','none');
            $(fsp[fsi.i+1]).css('display','none');
            $(sndp[sndi.i+3]).css('display','none');
            $(sndp[sndi.i+2]).css('display','none');
            $(sndp[sndi.i+1]).css('display','none');
            $(thrdp[thrdi.i+3]).css('display','none');
            $(thrdp[thrdi.i+2]).css('display','none');
            $(thrdp[thrdi.i+1]).css('display','none');
            InScreenProduct = 1;
        }

        else  if (width > 725)
        {
            $('.product').removeClass('col-xs-4').removeClass('col-xs-12').removeClass('col-xs-6').addClass('col-xs-3');
            $(fsp[fsi.i+3]).css('display','block');
            $(fsp[fsi.i+2]).css('display','block');
            $(fsp[fsi.i+1]).css('display','block');
            $(sndp[sndi.i+3]).css('display','block');
            $(sndp[sndi.i+2]).css('display','block');
            $(sndp[sndi.i+1]).css('display','block');
            $(thrdp[thrdi.i+3]).css('display','block');
            $(thrdp[thrdi.i+2]).css('display','block');
            $(thrdp[thrdi.i+1]).css('display','block');
            InScreenProduct = 4;
        }
    })

    $(fsp[fsi.i]).css('display','block');
    $(fsp[fsi.i+1]).css('display','block');
    $(fsp[fsi.i+2]).css('display','block');
    $(fsp[fsi.i+3]).css('display','block');
    $(sndp[sndi.i]).css('display','block');
    $(sndp[sndi.i+3]).css('display','block');
    $(sndp[sndi.i+2]).css('display','block');
    $(sndp[sndi.i+1]).css('display','block');
    $(thrdp[thrdi.i]).css('display','block');
    $(thrdp[thrdi.i+3]).css('display','block');
    $(thrdp[thrdi.i+2]).css('display','block');
    $(thrdp[thrdi.i+1]).css('display','block');
    $(window).trigger('resize');
}) ;
