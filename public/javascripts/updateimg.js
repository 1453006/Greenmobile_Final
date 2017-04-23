
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

$(".updateimg  #imag").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='updateimg[0]']").val(filename);
    var imgControlName = ".updateimg  #ImgPreview";
    readURL(this, imgControlName);
    $('.updateimg  .preview1').addClass('it');
    $('.updateimg  .btn-rmv1').addClass('rmv');
});
$(".updateimg #imag2").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='updateimg[1]']").val(filename);
    var imgControlName = ".updateimg  #ImgPreview2";
    readURL(this, imgControlName);
    $('.updateimg  .preview2').addClass('it');
    $('.updateimg  .btn-rmv2').addClass('rmv');
});
$(".updateimg #imag3").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='updateimg[2]']").val(filename);
    var imgControlName = ".updateimg  #ImgPreview3";
    readURL(this, imgControlName);
    $('.updateimg  .preview3').addClass('it');
    $('.updateimg  .btn-rmv3').addClass('rmv');
});
$(".updateimg #imag4").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='updateimg[3]']").val(filename);
    var imgControlName = ".updateimg  #ImgPreview4";
    readURL(this, imgControlName);
    $('.updateimg  .preview4').addClass('it');
    $('.updateimg  .btn-rmv4').addClass('rmv');
});
$(".updateimg #imag5").change(function() {
    // add your logic to decide which image control you'll use
    var filepath = $(this).val();
    var filename = filepath.split(/[\/\\]/).slice(-1).toString();
    filename ='"' + filename + '"';
    $("input[name='updateimg[4]']").val(filename);
    var imgControlName = ".updateimg  #ImgPreview5";
    readURL(this, imgControlName);
    $('.updateimg  .preview5').addClass('it');
    $('.updateimg  .btn-rmv5').addClass('rmv');
});

$(".updateimg #removeImage1").click(function(e) {
    e.preventDefault();
    $(".updateimg #imag").val("");
    $(".updateimg #ImgPreview").attr("src", "");
    $('.updateimg .preview1').removeClass('it');
    $('.updateimg .btn-rmv1').removeClass('rmv');
    $("input[name='updateimg[0]']").val('""');
});
$(".updateimg #removeImage2").click(function(e) {
    e.preventDefault();
    $(".updateimg #imag2").val("");
    $(".updateimg #ImgPreview2").attr("src", "");
    $('.updateimg .preview2').removeClass('it');
    $('.updateimg .btn-rmv2').removeClass('rmv');
    $("input[name='updateimg[1]']").val('""');
});
$(".updateimg #removeImage3").click(function(e) {
    e.preventDefault();
    $(".updateimg #imag3").val("");
    $(".updateimg #ImgPreview3").attr("src", "");
    $('.updateimg .preview3').removeClass('it');
    $('.updateimg .btn-rmv3').removeClass('rmv');
    $("input[name='updateimg[2]']").val('""');
});
$(".updateimg #removeImage4").click(function(e) {
    e.preventDefault();
    $(".updateimg #imag4").val("");
    $(".updateimg #ImgPreview4").attr("src", "");
    $('.updateimg .preview4').removeClass('it');
    $('.updateimg .btn-rmv4').removeClass('rmv');
    $("input[name='updateimg[3]']").val('""');
});
$(".updateimg #removeImage5").click(function(e) {
    e.preventDefault();
    $(".updateimg #imag5").val("");
    $(".updateimg #ImgPreview5").attr("src", "");
    $('.updateimg .preview5').removeClass('it');
    $('.updateimg .btn-rmv5').removeClass('rmv');
    $("input[name='updateimg[4]']").val('""');
});