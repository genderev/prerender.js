# prerender.js
Prerender on hover in any browser.

## What is prerender.js?

Prerendering loads all the assets of a page before the user navigates to that page. Conventionally, prerendering [is like opening the URL in a hidden tab](http://www.stevesouders.com/blog/2013/11/07/prebrowsing/) and then showing that hidden tab once the user clicks on it.

prerender.js is a way to prerender any link the user hovers over. If that link is in a button or `<a>` element, prerender.js works. If the user is on mobile, prerender.js works. If the user's browser is Internet Explorer 8, prerender.js works. prerender.js focuses on the guarantee of web performance for a wide variety of users in any situation.

## Performance
A page on my site without prerender.js had 1.37s page load. With prerender.js it had a 600ms page load. 

## Download

For Node:
`npm i prerender`

For the browser:
`jsDelivr.com`

## Documentation

Here's how to use prerender.js with buttons:
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
If you want to make the functionality for buttons better, make a pull request to the Github repo. `<a>` tags do not require any configuration to enable prerender besides including the script in the page.

## Happy Customers
Your name could be here. If you use this code in your project, make a pull request to this repo so you can be added to the list.
