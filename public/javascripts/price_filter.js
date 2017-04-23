range = $('.range-slider > .input-range');
value = $('.range-slider > .range-value');

value.val(range.attr('value'));

range.on('input', function(){
    //monparent=$(this).parent();
    monparent=this.parentNode;

    value=$(monparent).find('.range-value');
    $(value).val(this.value);
});

value.on('input', function(){
    monparent=this.parentNode;
    range=$(monparent).find('.input-range');
    $(range).val(this.value);

});