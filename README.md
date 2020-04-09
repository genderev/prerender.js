![png](assets/prerender.png)
![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)
![GitHub license1](https://img.shields.io/github/languages/top/genderev/prerender.js)
![GitHub license2](https://img.shields.io/github/languages/code-size/genderev/prerender.js)
![GitHub license3](https://img.shields.io/github/issues-pr/genderev/prerender.js)
![GitHub license4](https://img.shields.io/github/issues/genderev/prerender.js)





# prerender.js 

**prerender.js** is basically [instant.page](https://instant.page/) but prerendering instead of prefetching and gives support for all browsers.

## Project Features

Prerendering loads all the assets of a page before the user navigates to that page. Conventionally, prerendering [is like opening the URL in a hidden tab](http://www.stevesouders.com/blog/2013/11/07/prebrowsing/) and then showing that hidden tab once the user clicks on it.

**prerender.js** is a way to preload any link the user hovers over. Based on a prerendering [polyfill](https://github.com/samyk/jiagra), it loads the next page in a hidden iframe. If that link is in a button or link element, *prerender.js runs*. If the user is on mobile, *prerender.js runs*. If the user's browser is Internet Explorer 8, *prerender.js runs*. **prerender.js** focuses on the guarantee of web performance for all users.

## Data
A page on my site without **prerender.js** had 1.37s page load. With **prerender.js** that same page had a 600ms page load. A website where this is already live is under development, but you can [ask me](https://twitter.com/fleshmecha) about it later when it's done.

## Installers

For Node:
`npm i prerender_all`


For the browser:
`<script src="https://cdn.jsdelivr.net/npm/prerender_all@1.0.0/prerender.js"></script>`

## Downloading

You can also self-host by downloading prerender.js from Github and including it in your webpage as a script. Self-hosting is as simple as that - wherever your html files are, put the code for prerender.js there too.

## Documentation

To use **prerender.js** with buttons, check out buttons.js in the file directory.
Links do not require any configuration to enable prerender besides including the code for the script on the page.


## Contributors 
If you want to make the functionality for buttons better, make a pull request to the Github repo. If you think I missed something, make a pull request to this repo! I haven't been using this for a long time so I would love feedback and improvement. If you find a bug, try letting me know in the Issues tab.

## Credit
- [instant.page](https://instant.page/)
- [jiagra](https://github.com/samyk/jiagra)
