# Features
Prerender on hover in any browser.

## Project

Prerendering loads all the assets of a page before the user navigates to that page. Conventionally, prerendering [is like opening the URL in a hidden tab](http://www.stevesouders.com/blog/2013/11/07/prebrowsing/) and then showing that hidden tab once the user clicks on it.

**prerender.js** is a way to preload any link the user hovers over. Based on a prerendering [polyfill](https://github.com/samyk/jiagra), it loads the next page in a hidden iframe. If that link is in a button or link element, *prerender.js runs*. If the user is on mobile, *prerender.js runs*. If the user's browser is Internet Explorer 8, *prerender.js runs*. **prerender.js** focuses on the guarantee of web performance for all users.

## Performance
A page on my site without **prerender.js** had 1.37s page load. With **prerender.js** that same page had a 600ms page load. The website is still in development, but you can [ask me](https://twitter.com/fleshmecha) about it later when it's done.

## Download

For Node:
`npm i prerender`

For the browser:
`jsDelivr.com`

## Documentation

Here's how to use **prerender.js** with buttons:
```
function buttonRender() {
  var x = document.createElement("link");
  x.setAttribute("rel", "prerender");
  x.setAttribute("href", location.href); //location.href = "/example.html"
  document.head.appendChild(x);
}
document.getElementById("mybutton").onmouseover = function() {buttonRender()};
document.getElementById("mybutton").ontouchstart = function() {buttonRender()};
```
Links do not require any configuration to enable prerender besides including the code for the script on the page.

## Happy Customers
Your name could be here. If you use this code in your project, make a pull request to this repo so you can be added to the list.

## Contributors (Develop)
If you want to make the functionality for buttons better, make a pull request to the Github repo. If you think I missed something, make a pull request to this repo! I haven't been using this for a long time so I would love feedback and improvement. If you find a bug, try letting me know in the Issues tab.

## Credit
[instant.page](https://instant.page/)
[jiagra](https://github.com/samyk/jiagra)
