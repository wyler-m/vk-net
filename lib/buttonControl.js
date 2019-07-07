

function collaps_control(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
}
function w3_open() {
    document.getElementById("hideDiv").style.display = "block";
    $("#openMenu").toggle();
    $("#closeMenu").toggle();        

}
function w3_close() {
    document.getElementById("hideDiv").style.display = "none";
    $("#openMenu").toggle();
    $("#closeMenu").toggle();        
   }
