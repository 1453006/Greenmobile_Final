/**
 * Created by Zac on 4/5/17.
 */
function readURL(input, imgControlName) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $(imgControlName).attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$(".insertimg  #imag").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='img[0]']").val(filename);
    var imgControlName = ".insertimg  #ImgPreview";
    readURL(this, imgControlName);
    $('.insertimg  .preview1').addClass('it');
    $('.insertimg  .btn-rmv1').addClass('rmv');
});
$(".insertimg #imag2").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='img[1]']").val(filename);
    var imgControlName = ".insertimg  #ImgPreview2";
    readURL(this, imgControlName);
    $('.insertimg  .preview2').addClass('it');
    $('.insertimg  .btn-rmv2').addClass('rmv');
});
$(".insertimg #imag3").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='img[2]']").val(filename);
    var imgControlName = ".insertimg  #ImgPreview3";
    readURL(this, imgControlName);
    $('.insertimg  .preview3').addClass('it');
    $('.insertimg  .btn-rmv3').addClass('rmv');
});
$(".insertimg #imag4").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='img[3]']").val(filename);
    var imgControlName = ".insertimg  #ImgPreview4";
    readURL(this, imgControlName);
    $('.insertimg  .preview4').addClass('it');
    $('.insertimg  .btn-rmv4').addClass('rmv');
});
$(".insertimg #imag5").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='img[4]']").val(filename);
    var imgControlName = ".insertimg  #ImgPreview5";
    readURL(this, imgControlName);
    $('.insertimg  .preview5').addClass('it');
    $('.insertimg  .btn-rmv5').addClass('rmv');
});

$(".insertimg #removeImage1").click(function(e) {
    e.preventDefault();
    $(".insertimg #imag").val("");
    $(".insertimg #ImgPreview").attr("src", "");
    $('.insertimg .preview1').removeClass('it');
    $('.insertimg .btn-rmv1').removeClass('rmv');
    $("input[name='img[0]']").val('""');
});
$(".insertimg #removeImage2").click(function(e) {
    e.preventDefault();
    $(".insertimg #imag2").val("");
    $(".insertimg #ImgPreview2").attr("src", "");
    $('.insertimg .preview2').removeClass('it');
    $('.insertimg .btn-rmv2').removeClass('rmv');
    $("input[name='img[1]']").val('""');
});
$(".insertimg #removeImage3").click(function(e) {
    e.preventDefault();
    $(".insertimg #imag3").val("");
    $(".insertimg #ImgPreview3").attr("src", "");
    $('.insertimg .preview3').removeClass('it');
    $('.insertimg .btn-rmv3').removeClass('rmv');
    $("input[name='img[2]']").val('""');
});
$(".insertimg #removeImage4").click(function(e) {
    e.preventDefault();
    $(".insertimg #imag4").val("");
    $(".insertimg #ImgPreview4").attr("src", "");
    $('.insertimg .preview4').removeClass('it');
    $('.insertimg .btn-rmv4').removeClass('rmv');
    $("input[name='img[3]']").val('""');
});
$(".insertimg #removeImage5").click(function(e) {
    e.preventDefault();
    $(".insertimg #imag5").val("");
    $(".insertimg #ImgPreview5").attr("src", "");
    $('.insertimg .preview5').removeClass('it');
    $('.insertimg .btn-rmv5').removeClass('rmv');
    $("input[name='img[4]']").val('""');
});