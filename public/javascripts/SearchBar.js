/**
 * Created by root on 3/30/17.
 */
function onBarFocus() {
    document.getElementById('search-place').style.width ='97%'
    document.getElementById('search-place').style.borderColor ='grey'
    document.getElementById('search-place').style.boxShadow ='0 0 6px grey';
}

function onBarBlur() {
    document.getElementById('search-place').style.width ='80%'
    document.getElementById('search-place').style.borderColor ='black'
    document.getElementById('search-place').style.boxShadow ='none';
}