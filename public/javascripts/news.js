/**
 * Created by Hoang Bao on 4/12/2017.
 */
$(document).ready(function()
{
    console.log("asdasd");
    var speed = 500
    var autoswitch = true
    var autoswitch_speed = 4000
    //Add initial active class
    $('.slide').first().addClass('active')
    $('.slide').hide()
    $('.active').show()
    $('#next').on('click', Continues)
    $('#prev').on('click', Previous)
    if (autoswitch == true)
    {
        setInterval(Continues, autoswitch_speed)
    }
    function Continues() {
        $('.active').removeClass('active').addClass('oldActive')
        if ($('.oldActive').is(':last-child'))
        {
            $('.slide').first().addClass('active')
        }
        else
        {
            $('.oldActive').next().addClass('active')
        }
        $('.oldActive').removeClass('oldActive')
        $('.slide').fadeOut(speed)
        $('.active').fadeIn(speed)
    }
    function Previous() {
        $('.active').removeClass('active').addClass('oldActive')
        if ($('.oldActive').is(':first-child')) {
            $('.slide').last().addClass('active')
        } else {
            $('.oldActive').prev().addClass('active')
        }
        $('.oldActive').removeClass('oldActive')
        $('.slide').fadeOut(speed)
        $('.active').fadeIn(speed)
    }
});
