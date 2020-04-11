(function(w, d, undefined)
{
	// are degrading script tags enabled by default?
	var degradeEnabled = 1;

	// set this to 0 if you suspect any of the pre-rendered
	// URLs will use javascript to framebreak!
	var useIframe = 1;

	// when using iframes to precache pages, we can replace the
	// actual links on the page with an onclick handler that makes
	// the iframe span the entire page instead of redirecting
	var replaceLinks = 1;

	// size in px of scrollbar
	var scrollBuffer = 20;

	var scripts = d.getElementsByTagName('script'),
		a		= d.getElementsByTagName('a'),
		link	= d.getElementsByTagName('link'),
		meta	= d.getElementsByTagName('meta');


	/***************************************************************************/
	/* degrading script tags */
	/* this code is by John Resig */
	/* see: http://ejohn.org/blog/degrading-script-tags/ */
	/***************************************************************************/

	var smartTags = function()
	{
		// dynamic array, .length may change
		for (var i = 0, l = scripts.length; i < l; i++)
		{
			// the array may change as it's dynamic so store object
			// in case something gets inserted before it
			var script = scripts[i];
			var degrade = script.getAttribute('data-degrade');

			// finds scripts with a URL and execute the contents inside
			if (script.src && !script.jExecuted && (
				( degradeEnabled && !fals(degrade)) ||
				(!degradeEnabled &&  tru (degrade)))
			)
			{
				script.jExecuted = true;
				if (script.innerHTML)
					eval(script.innerHTML);
			}
		}
	};


	/***************************************************************************/
	/* allow monitoring timers */
	/***************************************************************************/

	var timers = {};

	// allow checking whether a timer is set, fired or cleared
	w.checkInterval  = w.checkTimeout = function(timer) { return timers[timer] };

	// return list of fired timers (at least fired once)
	w.firedTimeouts    = w.firedIntervals = function()
	{
		var fired = [];
		for (var timer in timers)
			if (timers[timer].substr(0, 5) === 'fired')
				fired.push(timer);
		return fired;
	};

	// return list of cleared timers
	w.clearedTimeouts  = w.clearedIntervals = function()
	{
		var cleared = [];
		for (var timer in timers)
			if (timers[timer] === 'cleared' || timers[timer] === 'firedCleared')
				cleared.push(timer);
		return cleared;
	};

	// return list of active timers
	w.activeTimeouts = w.activeIntervals = function()
	{
		var active = [];
		for (var timer in timers)
			// an interval that's been fired is still active
			if (timers[timer] === 'active' || timers[timer] === 'firedActive')
				active.push(timer);
		return active;
	};

	w._setTimeout    = w.setTimeout;
	w._setInterval   = w.setInterval;
	w._clearTimeout  = w.clearTimeout;
	w._clearInterval = w.clearInterval;
	w.clearInterval  = w.clearTimeout = function(timer)
	{
		// if it's already fired or doesn't exist, you can't really clear it.
		if (timers[timer] === 'active' || timers[timer] === 'firedActive')
		{
			w._clearInterval(timer);
			timers[timer] = timers[timer] === 'active' ? 'cleared' : 'firedCleared';
			return true;
		}
		else if (timers[timer])
			return false;

		// timer that doesn't exist
		return undefined;
	};
	w.setTimeout  = function () { return newSetTimeout(true,  Array.prototype.slice.call(arguments)) };
	w.setInterval = function () { return newSetTimeout(false, Array.prototype.slice.call(arguments)) };

	// our new timer tracker
	var newSetTimeout = function(timeout, args)
	{
		// if we're passing a function ref or a string (don't use a string n00b!)
		var origFn = typeof(args[0]) === 'function' ? args[0] : new Function(args[0]);

		// our function calls a placeholder function that gets replaced once we know our timer id
		// leave origFn in there just in case we get called before getting replaced (shouldn't happen)
		// gecko also passes back the # of ms late it was to call back
		var temp = function(ms) { return origFn(ms); };

		// replace with placeholder
		args[0] = function(ms) { return temp(ms) };

		// create our real timer
		// XXX -- do we need to allow different scope other than `this`?
		var fn = timeout ? w._setTimeout : w._setInterval;

		// support IE6
		var timer = fn.apply ? fn.apply(this, args) : fn(args[0], args[1], args[2]);

		// now change the sub-function we call to know when we've fired
		// now that we know our timer ID (only known AFTER calling setTimeout)
		temp = function(ms)
		{
			// now we've been fired by the timeout
			timers[timer] = timeout ? 'fired' : 'firedActive';
			return origFn(ms);
		};

		// we have an active (set) timer
		timers[timer] = 'active';
		return timer;
	};



	/***************************************************************************/
	/* handle prerendering */
	/***************************************************************************/

	var visibleFrame,
		origDocSettings;

	// Scan the page once for all of the link and meta elements that might have prefetch info
	var prefetchObjs = [];

	// Checks for a change in w.location.hash, and if so returns us to the original page
	var checkHash = function(href)
	{
		// We clicked off the hash, clear the iframe and set the body back
		if (w.location.hash !== '#' + href)
		{
			// Reset our page back to how it was before the iframe was displayed
			if (origDocSettings)
			{
				d.body.style.height    = origDocSettings.height;
				d.body.style.maxHeight = origDocSettings.maxHeight;
				d.body.style.overflow  = origDocSettings.overflow;
				d.body.style.padding   = origDocSettings.padding;
				d.body.style.margin    = origDocSettings.margin;
				d.body.style.border    = origDocSettings.border;
			}

			// Make the iframe invsible and delete the height/width so it doesn't give the page unnecessary scroll bars
			visibleFrame.style.visibility = 'hidden';
			visibleFrame.style.height = '';
			visibleFrame.style.width = '';

			return true;
		}

		return false;
	};


	// track our rendered stuff so we don't double-request
	var rendered = {};

	// we run this every time to replace iframes ASAP
	var replaceLink = function(href)
	{
		for (var i = 0; i < a.length; i++)
		{
			if (a[i].href === href || a[i].href === href + '/')
			{
				var oldOnclick = a[i].onclick;
				a[i].onclick = (function(href, oldOnclick) {
					return function() {
						if (oldOnclick) oldOnclick();

						// Set a new location, so the back button returns us to our original page
						w.location.href = '#' + href;
						// Look for the hash to change. If it does (back button pressed), hide the iframe
						(function()
						{
							if (!checkHash(href))
								w.setTimeout(arguments.callee, 100);
						})();

						visibleFrame = d.getElementById(href);
						var height = d.documentElement.clientHeight;
						height -= pageY(visibleFrame) + scrollBuffer;
						height = (height < 0) ? 0 : height;

						// Modify page all at once
						visibleFrame.style.zIndex = "1337";
						d.body.style.height    = "100%";
						d.body.style.maxHeight = "100%";
						d.body.style.overflow  = "hidden";
						d.body.style.padding   = "0";
						d.body.style.margin    = "0";
						d.body.style.border    = "0";
						visibleFrame.style.backgroundColor = "#FFFFFF";
						visibleFrame.style.height     = height + 'px';
						visibleFrame.style.border     = "0";
						visibleFrame.style.width      = '100%';
						visibleFrame.style.visibility = 'visible';
						visibleFrame.contentWindow.focus();
						w.onresize = arguments.callee;
						return false;
					};
				})(href, oldOnclick);
			}
		}
	};

	var pageY = function(elem)
	{
		return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
	};

	var prerender = function(href, i)
	{
		// already rendered
		if (rendered[href])
			return findprerender(i + 1);
		rendered[href] = 1;

		// We're not really rendering, just loading the page in
		// a hidden iframe in order to cache all objects on the page.
		var iframe = d.createElement(useIframe ? 'iframe' : 'img');
		iframe.style.visibility = 'hidden';
		iframe.style.position   = 'absolute';
		iframe.onload = iframe.onerror = function()
		{
			// load next prerender so we don't render multiple items simultaneously
			if (useIframe && replaceLinks)
				replaceLink(href);
			findprerender(i + 1);
		};
		iframe.src = href;
		iframe.id  = href;

		// append iframe to DOM
		d.body.insertBefore(iframe, d.body.firstChild);
	};

	// go through objects to prerender
	var findprerender = function(i)
	{
		for (; i < prefetchObjs.length; i++)
			// Process link tags
			if (prefetchObjs[i].nodeName === "LINK" && prefetchObjs[i].rel && prefetchObjs[i].rel.match(/\b(?:pre(?:render|fetch)|next)\b/))
				return prerender(prefetchObjs[i].href, i);
			// Process meta tags
			else if (prefetchObjs[i].nodeName === "META" && prefetchObjs[i].httpEquiv === "Link" && prefetchObjs[i].content && prefetchObjs[i].content.match(/\brel=(?:pre(?:render|fetch)|next)\b/))
				if (url = prefetchObjs[i].content.match(/^<(.*)>; /))
					return prerender(url[1], i);
	};

	// onload function for prerendering
	var startPrerendering = function()
	{
		// Put all the objects onto one array that we can process later
		var llen = link.length, mlen = meta.length;
		for (var x = 0; x < llen; x++)
			prefetchObjs[x] = link[x];

		for (; x - llen < mlen; x++)
			prefetchObjs[x] = meta[x - llen];

		if (prefetchObjs.length > 0)
		{
			// Remember the settings we are going to modify when displaying the iframe (if we have replaceLinks on)
			if (replaceLinks && !origDocSettings)
				origDocSettings = {
					'height':		d.body.style.height,
					'maxHeight':	d.body.style.maxHeight,
					'overflow':		d.body.style.overflow,
					'padding':		d.body.style.padding,
					'margin':		d.body.style.margin,
					'border':		d.body.style.border
				};

			// Find all pre-renders and do it!
			findprerender(0);
		};
	};


	/***************************************************************************/
	/* document.currentScript polyfill + improvements */
	/***************************************************************************/
	/*
		Notes:
		document.currentScript in FF4/Opera isn't useful because it won't return from a callback or event handler
		Chrome / FF3+ work fine (via try/catch)
		IE can *either* obtain params passed to function (via try/catch) OR obtain URL script executed from (via window.onerror), but not sure if both will work together
		Safari < 5.1 doesn't support window.onerror nor does it provide full trace (via try/catch), however you can get "last" stack URL from try/catch (e.sourceURL)
		arguments.callee.caller returns null from remotely loaded JS
		Setting a global var during onload isn't useful because the JS will start to execute first
		Setting a global var just before creating the script isn't useful because the call may be asynchronous and another JS file may load and execute at that time, then believe it's a different script
		This works when scripts are created through a script tag, d.createElement() or d.write(), doesn't matter
	*/
	d._currentScript = d.currentScript;

	// return script object based off of src
	var getScriptFromURL = function(url)
	{
		for (var i = 0; i < scripts.length; i++)
			if (scripts[i].src === url)
				return scripts[i];

		return undefined;
	}

	var actualScript = d.actualScript = function()
	{
		// use native implementation if it knows what's up (doubt it, sucker)
		if (d._currentScript)
			return d._currentScript;

		// we could hit a function outside of try to call window.onerror and get url, but problem with this:
		// 1) onerror won't resume execution
		// 2) doesn't tell us what was *passed* to the function (doesn't matter here)
		// 3) safari doesn't support window.onerror
		// this might be a good solution for MSIE though since stack trace does not show URLs
		/*
		if (navigator.userAgent.indexOf('MSIE ') !== -1)
		{
			w.onerror = function(error, url, line)
			{
				if (error.indexOf('Object exp') !== -1)
				{
					foo2(undefined, url);
					return true;
				}
			};
			omgwtf
		}
		*/

		var stack;
		try
		{
			omgwtf
		} catch(e) {
			stack = e.stack;
		};

		if (!stack)
			return undefined;

		// chrome uses at, ff uses @
		var e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
		while (stack.indexOf(e) !== -1)
			stack = stack.substring(stack.indexOf(e) + e.length);
		stack = stack.substring(0, stack.indexOf(':', stack.indexOf(':')+1));

		return getScriptFromURL(stack);
	};
	if (d.__defineGetter__)
		d.__defineGetter__('currentScript', actualScript);


	/***************************************************************************/
	/* onload events to fire */
	/***************************************************************************/
	addEvent(function() {
		// begin our prerendering routine
		startPrerendering();

		// use our smart "degrading" script tags
		smartTags();
	});


	/***************************************************************************/
	/* general functions */
	/***************************************************************************/

	function addEvent(cb, evt, obj)
	{
		// default to onload
		if (!evt)
			evt = 'load';

		// default to window as 'this'
		if (!obj)
			obj = w;

		// if we're already completed, run now
		if (d.readyState === 'complete')
			cb();

		// set event listener
		else if (obj.addEventListener)
			obj.addEventListener(evt, cb, false);
		else if (obj.attachEvent)
			obj.attachEvent('on' + evt, cb);
	}


	function tru(test)
	{
		return test === 'true' || test === true || test === '1' || test === 1;
	}

	// explicit false, this is NOT the same as !tru()
	function fals(test)
	{
		return test === 'false' || test === false || test === '0' || test === 0;
	}


})(this, this.document);

let t,e;const n=new Set,o=document.createElement("link"),s=o.relList&&o.relList.supports&&o.relList.supports("stylesheet")&&window.IntersectionObserver&&"isIntersecting"in IntersectionObserverEntry.prototype,i="instantAllowQueryString"in document.body.dataset,r="instantAllowExternalLinks"in document.body.dataset,a="instantWhitelist"in document.body.dataset;let c=65,d=!1,l=!1,u=!1;if("instantIntensity"in document.body.dataset){const t=document.body.dataset.instantIntensity;if("mousedown"==t.substr(0,"mousedown".length))d=!0,"mousedown-only"==t&&(l=!0);else if("viewport"==t.substr(0,"viewport".length))navigator.connection&&(navigator.connection.saveData||navigator.connection.effectiveType.includes("2g"))||("viewport"==t?document.documentElement.clientWidth*document.documentElement.clientHeight<45e4&&(u=!0):"viewport-all"==t&&(u=!0));else{const e=parseInt(t);isNaN(e)||(c=e)}}if(s){const n={capture:!0,passive:!0};if(l||document.addEventListener("touchstart",function(t){e=performance.now();const n=t.target.closest("a");if(!f(n))return;h(n.href)},n),d?document.addEventListener("mousedown",function(t){const e=t.target.closest("a");if(!f(e))return;h(e.href)},n):document.addEventListener("mouseover",function(n){if(performance.now()-e<1100)return;const o=n.target.closest("a");if(!f(o))return;o.addEventListener("mouseout",m,{passive:!0}),t=setTimeout(()=>{h(o.href),t=void 0},c)},n),u){let t;(t=window.requestIdleCallback?t=>{requestIdleCallback(t,{timeout:1500})}:t=>{t()})(()=>{const t=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting){const n=e.target;t.unobserve(n),h(n.href)}})});document.querySelectorAll("a").forEach(e=>{f(e)&&t.observe(e)})})}}function m(e){e.relatedTarget&&e.target.closest("a")==e.relatedTarget.closest("a")||t&&(clearTimeout(t),t=void 0)}function f(t){if(t&&t.href&&(!a||"instant"in t.dataset)&&(r||t.origin==location.origin||"instant"in t.dataset)&&["http:","https:"].includes(t.protocol)&&("http:"!=t.protocol||"https:"!=location.protocol)&&(i||!t.search||"instant"in t.dataset)&&!(t.hash&&t.pathname+t.search==location.pathname+location.search||"noInstant"in t.dataset))return!0}function h(t){if(n.has(t))return;const e=document.createElement("link");e.rel="prerender",e.href=t,document.head.appendChild(e),n.add(t)}
