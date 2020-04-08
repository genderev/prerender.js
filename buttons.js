function buttonRender() {

  var x = document.createElement("link");

  x.setAttribute("rel", "prerender");

  x.setAttribute("href", location.href); //location.href = "/example.html"

  document.head.appendChild(x);

}

document.getElementById("mybutton").onmouseover = function() {buttonRender()};

document.getElementById("mybutton").ontouchstart = function() {buttonRender()};

