# Southstreet Progressive Enhancement Workflow
## Our tools & workflow for cross-device web applications

Southstreet is a set of tools that combine to form the core of a progressive enhancement workflow developed at [Filament Group](http://filamentgroup.com). This workflow is designed to help developers deliver rich web experiences that are accessible to the widest range of devices possible, and catered to the capabilities and constraints of each device. Our Southstreet workflow utilizes the following tools at a minimum, all of which are independent Github projects themselves:

- [Enhance](https://github.com/filamentgroup/enhance): a tiny JavaScript framework designed to help developers determine if a browser is capable of handling additional JavaScript and CSS enhancements, and load specific enhancements for that browser as fast and simply as possible.
- [QuickConcat](https://github.com/filamentgroup/quickconcat): a simple dynamic concatenator for html, css, and js files, written in PHP
- [Wrap](https://github.com/filamentgroup/wrap): a modular JavaScript library for DOM manipulation and Ajax, inspired by the jQuery API
- [AjaxInclude](https://github.com/filamentgroup/ajaxinclude): a plugin that is designed for modular content construction, that runs on Wrap (or jQuery)

Together these tools form the core of Filament Group's progressive enhancement workflow, and the `_tmpl` folder of this repository contains a working example of these tools working together. Let's break down the role that each one plays.

## Enhance

[Enhance](https://github.com/filamentgroup/enhance) is a tiny JavaScript framework designed to help developers determine if a browser is capable of handling additional JavaScript and CSS enhancements, and load specific enhancements for that browser as fast and simply as possible. `Enhance` provides [an API](https://github.com/filamentgroup/enhance/#readme) for some simple tasks such as checking whether an element has a particular classname, and assembling and requesting JavaScript and CSS files via a single, concatenated request. 

Typically, a site that uses Enhance will start by including (anywhere in the page, or in the `head` if necessary) at least two JavaScript files that will drive the progressive enhancement process: `enhance.js`, and a custom file that uses the `enhance.js` API to configure and enhance the user experience (or not) based on various conditions: for example purposes, we'll call that custom file `enhance.audit.js`. The role of `enhance.audit.js` is to determine if – and with which files – a browser's experience should be enhanced. Within `enhance.audit.js`, the following steps might be taken:

* Determine if a browser is broadly qualified enhancements and if not, exit early (a broad qualification might consist of detecting `document.querySelectorAll` support, CSS3 Media Queries support, or any other technology critical to an application's enhanced experience)
* Reference the JavaScript and CSS files that may potentially be loaded
* Queue certain files for loading based on various environmental conditions, browser capabilities, screen size, markup conditions, and more.
* Enhance the page by loading those files via a single, concatenated request.

For an example of how this process actually breaks down in JavaScript, check out the `enhance.audit.js` file in this repository.

_Note that loading CSS dynamically, or lazily, in this fashion can cause undesirable results because it will likely arrive after the website has begun rendering, causing a FOUC when its styles snap into place. Because of this, you'll want to include any CSS that's essential to rendering the page being requested via the `head` of the page, through a traditional `style` tag. This limitation means `enhance.js` is more useful for loading JavaScript files, but you can use it to load CSS as well, as long as that CSS is not critical to the intial page rendering (styles associated with an overlay panel not currently in view might be a good candidate for this sort of loading)._

All of these tasks can be facilitated simply through the [`enhance.js` `api`](https://github.com/filamentgroup/enhance/blob/master/_docs/API.md). However, Enhance.js itself does not handle the server-side concatenation that it is designed to interface with. Nor does it handle the application of enhancements itself. For those, let's move on.

## QuickConcat

[QuickConcat](https://github.com/filamentgroup/quickconcat) is a simple dynamic concatenator for html, css, and js files, written in PHP. Interacting with QuickConcat is simple: send it a URL containing several comma-separated filepaths, and it will combine those files and return them as a single response. It has a few simple features, described in its README, but basically, a QuickConcat URL looks something like the following:

    quickconcat.php?files=js/myfileA.js,js/myfileB.js

Or better yet...

    js/myfileA.js,js/myfileB.js=concat

That's pretty much it; you can find the `quickconcat.php` source code along with more examples and implementation notes in the [QuickConcat project readme](https://github.com/filamentgroup/quickconcat#readme).

Within our PE workflow, QuickConcat is used by `Enhance.js` to combine many different JavaScript or CSS files into a single request (per language). It is also used by `AjaxInclude` to combine different HTML files (more on that below). QuickConcat can also be used manually to combine JavaScript and stylesheet references in your document. For example, a site using Enhance might start by including `enhance.js` and `enhance.audit.js` like so:

    <script src="/_js/lib/enhance.js,/_js/enhance.audit.js"></script>

...and the necessary CSS files

Like many of the tools that comprise the Enhance pattern, QuickConcat is just as much a functional tool as it is a suggested pattern - the technology behind the implementation is less important than the workflow it facilitates. For small-scale production environments, quickconcat.php itself may be a suitable tool for use in a live website. However, at Filament Group, we typically only use QuickConcat during the initial development phase of a project, as it is easy to configure and get working quickly but does not include features for serving files quickly in a large-scale production environment. Early in a development phase, we commonly advise clients in building a custom file concatenation service similar to QuickConcat, but more robust and using their preferred languages, so that it can integrate tightly with their system in ways QuickConcat does not (at least by default).

In that vein, we recommend that a dynamic file concatenation tool provides at least the following services when deployed in a large-scale application:

1. Dynamic file concatenation via URL, combining separate files into one response via a comma-separated request (QuickConcat does this)
2. Minify the source files before or after combination, removing whitespace, comments, and in the case of JavaScript, optimizing the code itself to reduce its weight. Many open-source tools are available for this. We’d recommend checking out the Java-based [Google Closure Compiler](http://code.google.com/closure/compiler/) and [YUI Compressor](http://developer.yahoo.com/yui/compressor/) tools, or the Node.js-based [Uglify.js](https://github.com/mishoo/UglifyJS) (of these, YUI is designed to compress CSS as well).
3. Transfer the output file in GZIP compressed format. Most server-side environments provide tools for gzip output (see the [QuickConcat Readme](https://github.com/filamentgroup/quickconcat#readme) for an example using Apache)
4. When a particular combination of files is requested, its output should be saved as a static resource on the site's server or CDN, and all future requests should be directed straight to that file instead of dynamically generating it again. _In this way, different devices will generate the various file combinations, and the second time a particular browser/device combo visits the site, the server can deliver that file much more efficiently. We also recommend pre-generating common file combinations during deployment so that many popular combinations will never need to be generated dynamically during a request_
5. For use with AjaxInclude (explained below), we recommend that the concatenation tool includes a feature to wrap each file contents in an identifier node, if requested to do so. For more information on this, please see "Configuring a concatenation tool to work with AjaxInclude" below.

With `enhance.js` and `quickconcat.php` covered, we can move on to the actual enhancements.

## Wrap

[Wrap](https://github.com/filamentgroup/wrap) is a simple framework of DOM utilities that is designed to target modern browsers without failing the rest. 

Within the Enhance workflow at Filament Group, we use Wrap for enhancing the user experience by manipulating markup, making Ajax requests, and any other common tasks one would do when using an unobtrusive JavaScript DOM framework.

Wrap is inspired by the jQuery API, letting you find elements and manipulate them. Uniquely however, Wrap is written in such a way that it'll only do anything at all in modern browsers, like Internet Explorer 8 and up. Other browsers? They'll get a less-enhanced experience. There won't be errors, but there may be less _zing_. Assuming you're already building applications with Progressive Enhancement, you should be fine without JavaScript enhancements. In that way, jQuery and Wrap have dramatically different aims regarding support: jQuery works pretty much anywhere, and is fault-tolerant to infinite levels of developer happiness... Wrap: not so much. It only supports a subset of the nice things jQuery does, and almost that entire subset is optional. That combined with its browser support qualifications allow it to be a very small library, ideal – we find – for cross-device progressive enhancement.

Technically, `wrap.js` itself is a simple, small (half a kb), extendable core function. Basically, you use Wrap like you use jQuery (just reference the `wrap` variable instead of `$` or `jQuery`), but it doesn't come with much more than a means of finding and generating HTML multiple elements, a DOM-ready handler, and a few essential element-iterating methods like `each`, `find`, `children`. Using its API, Wrap is simple to extend further, and many extensions are available in the Wrap project for you to include in your build.

Check out the [Wrap project readme](https://github.com/filamentgroup/wrap#readme) for more information on use. 

## AjaxInclude

[AjaxInclude](https://github.com/filamentgroup/ajaxinclude), the final tool in our Progressive Enhancement stack, shapes the way we think about content and document construction in a major way. AjaxInclude uses the Wrap (or jQuery if you prefer) API to bring the concept of an "include" to HTML, allowing us to deliver lightweight web pages that contain only the most essential content, and lazy-loading additional content automatically via JavaScript.

AjaxInclude works by referencing external fragments of HTML content via HTML5 data attributes. For example:

    <a href="articles/latest/" data-before="articles/latest/fragment">Latest Articles</a>

In this case, we have an ordinary link to external content, which is essential for accessibility across all devices, but the link is also tagged with a `data-before` attribute that references a URL that contains a fragment of that external content to pull into the page. The AjaxInclude plugin will see this and include that content _before_ the link.

You can add these attributes to elements in your page anywhere non-essential fragments of content can be included from an external URL. jQuery-api-like qualifiers like `data-after`, `data-before`, `data-append`, and `data-replace` are all supported. Also, the `data-threshold` attr allows a min width for this to apply.

Note: these attributes can be placed on any element, not just anchors. You might find `data-append` to be most useful on container elements.

Once the DOM is ready, you can apply the plugin like this: 

    $("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude();
	

Perhaps the most powerful feature of AjaxInclude is that it can be used with a proxy file concatenator (such as [quickconcat](https://github.com/filamentgroup/quickconcat)) to fetch ALL includes via a single HTTP request! To use a proxy and include all ajax includes in one call, just pass in a URL that is ready to accept a list of files:

    $("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude( "quickconcat.php?wrap&files=" );

### Configuring a concatenation tool to work with AjaxInclude

AjaxInclude expects the concatenator's response to wrap each HTML file in an identifier element like this: `<entry url="..file url...">..content...</entry>`. That way, AjaxInclude can know which piece of HTML came from which file, and insert them in the proper places in the document. With QuickConcat, this is as simple as adding a `&wrap` parameter to the query string. Because of the benefits this provides the AjaxInclude technique, we recommend that this functionality be built as part of a dynamic concatenation tool as well, in the event that QuickConcat is not sufficient for production. For more information on how this works, check out the [quickconcat docs](https://github.com/filamentgroup/quickconcat#readme).

## Wrap-up

The tools above combine to form the backbone of the Enhance workflow. Now that you understand the foundations, seeing it all in action should bring additional clarity. This repository includes a demo ([_demo.html](https://github.com/filamentgroup/enhance/blob/master/_demo.html)) that uses "Enhance" and "QuickConcat" to conditionally load a set of JavaScript and CSS files. If you check out the repo and run it on a web server, you'll get the full effect. We'll look to improve the demo further to utilize Wrap and AjaxInclude as well soon, but this should give you a good idea of how things can work.

