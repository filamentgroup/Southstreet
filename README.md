# Southstreet Progressive Enhancement Workflow
## Our tools and workflow for building fast and accessible cross-device web applications

Southstreet is a set of tools that combine to form the core of a progressive enhancement workflow developed at [Filament Group](http://filamentgroup.com). This workflow is designed to help us (and other developers too!) deliver rich web experiences that are accessible to the widest range of devices possible, and catered to the capabilities and constraints of each device. 

Our Southstreet workflow utilizes the following tools, all of which are independent Github projects themselves.  

- [Enhance](https://github.com/filamentgroup/enhance): a tiny JavaScript framework designed to help developers determine if a browser is capable of handling additional JavaScript and CSS enhancements, and load specific enhancements for that browser as fast and simply as possible.
- [eCSSential](https://github.com/filamentgroup/eCSSential): an experimental utility for making browsers load responsive CSS in a more responsible way.
- [QuickConcat](https://github.com/filamentgroup/quickconcat): a simple dynamic concatenator for html, css, and js files, written in PHP
- Wrap: a simple JavaScript utility for DOM manipulation and Ajax wrapped in a familiar API. (*not yet released)
- [AjaxInclude](https://github.com/filamentgroup/Ajax-Include-Pattern/): a plugin that is designed for modular content construction, that runs on Wrap (or jQuery)
- [AppendAround](https://github.com/filamentgroup/AppendAround): A JavaScript pattern for responsive, roving markup.
- [Picturefill](https://github.com/filamentgroup/picturefill/tree/div-markup): a simple pattern for overhead-free responsive images today.

Together these tools form the core of Filament Group's progressive enhancement workflow. The scope of these individual projects vary widely, but they all share a common goal of serving front-end code faster, either by preventing or deferring the loading of code and assets that are not essential to the device, or by offering light-weight alternatives to common patterns. 

For demonstration purposes, the `_tmpl` folder of this repository contains a working example of these tools working together.

Please note that while these tools do represent key components of our overall approach, their applicability to a particular project always varies, and these particular projects are not always the best tool for the job at hand. Depending on whether a particular tool makes sense for the problem we're solving, we will often use alternative tools that provide similar functionality instead. For example, we commonly use jQuery instead of Wrap (below), as Wrap provides a small subset of jQuery's featureset, and is not always appropriate for the needs of our projects. In essence, the projects in Southstreet are developed with a goal of ease of use and compatibility, but they should always be evaluated against other potential solutions. 

Let's break down the role that each one plays.

## Enhance (v2)

[Enhance](https://github.com/filamentgroup/enhance) is a tiny JavaScript utility designed to help developers keep overhead low while delivering enhancements to differing devices and device categories. Technically speaking, the role of Enhance is to determine if a browser is broadly capable of handling additional JavaScript and CSS enhancements, and then load specific enhancements for that browser as fast and simply as possible. `Enhance` provides [an API](https://github.com/filamentgroup/enhance/#readme) for some simple tasks such as checking whether an element has a particular classname, and assembling and requesting JavaScript and CSS files via a single, concatenated request. 

Typically, a site that uses Enhance will start by including (anywhere in the page, or in the `head` if necessary) at least two JavaScript files that will drive the progressive enhancement process: `enhance.js`, and a custom file that uses the `enhance.js` API to configure and enhance the user experience (or not) based on various conditions: for example purposes, we'll call that custom file `enhance.config.js`. The role of `enhance.config.js` is to determine if – and with which files – a browser's experience should be enhanced. Within `enhance.config.js`, the following steps might be taken:

* Determine if a browser is broadly qualified enhancements and if not, exit early (a broad qualification might consist of detecting `document.querySelectorAll` support, CSS3 Media Queries support, or any other technology critical to an application's enhanced experience)
* Reference the JavaScript files that may potentially be loaded
* Queue certain files for loading based on various environmental conditions, browser capabilities, screen size, markup conditions, and more.
* Enhance the page by loading those files via a single, concatenated request.

For an example of how this process actually breaks down in JavaScript, check out the `enhance.config.js` file in this repository.

_Note that while Enhance is capable of loading CSS in addition to JavaScript, loading CSS in this fashion can cause undesirable results because it will likely arrive after the website has begun rendering, causing a flash of unstyled content when its styles snap into place. Because of this, you'll want to include any CSS that's essential to rendering the page being requested via the `head` of the page, through a traditional `style` tag, or use eCSSential, explained below. This limitation means `enhance.js` is more useful for loading JavaScript files, and with the recent addition of eCSSential to the Southstreet workflow, we're likely to remove the CSS-related features from Enhance._

All of these tasks can be facilitated simply through the [`enhance.js` `api`](https://github.com/filamentgroup/enhance/blob/master/_docs/API.md). However, Enhance.js itself does not handle the server-side concatenation that it is designed to interface with. Nor does it handle the application of enhancements itself. We'll get to those in a bit...

## eCSSential

[eCSSential](https://github.com/filamentgroup/eCSSential) is to CSS what [Enhance](https://github.com/filamentgroup/enhance) is for JavaScript. In responsive, cross-device applications, we commonly apply CSS via CSS3 Media Queries to target certain device environments without applying in others. Unfortunately, there is no native way to do this in browsers without requiring a device to download all potentially applicable styles, and completely blocking page rendering during that time, both of which make for a great deal of overhead that grows with the complexity and applicable contexts of an application.

eCSSential is an experimental workaround to address this shortcoming. Unlike Enhance, eCSSential is designed to be used via an inline script tag in the `head` of a page. This is because we want it to execute as soon as possible (thus speeding up page rendering), and because it is small enough that it's arguably worth the tradeoff in cacheability that an external resource would provide.

eCSSential provides many features, but the default use-case is to drop it into the `head` of a page and call the `eCSSential()` function, passing in references to your available CSS files paired with media queries to specify their intended media context. eCSSential will parse through these and split the CSS into files that should be loaded immediately to apply in initial page rendering, and files that can be loaded lazily after the page has been shown. 

eCSSential does not require the use of concatenated CSS files, but for best performance, it is designed to be used in combination with them. With that, we'll move on to concatenation.


## QuickConcat

[QuickConcat](https://github.com/filamentgroup/quickconcat) is a simple dynamic concatenator for html, css, and js files, written in PHP. Interacting with QuickConcat is simple: send it a URL containing several comma-separated filepaths, and it will combine those files and return them as a single response. It has a few simple features, described in its README, but basically, a QuickConcat URL looks something like the following:

    quickconcat.php?files=js/myfileA.js,js/myfileB.js

Or better yet...

    js/myfileA.js,js/myfileB.js=concat

That's pretty much it; you can find the `quickconcat.php` source code along with more examples and implementation notes in the [QuickConcat project readme](https://github.com/filamentgroup/quickconcat#readme).

Within our PE workflow, QuickConcat is used by `Enhance.js` to combine many different JavaScript or CSS files into a single request (per language). It is also used by `AjaxInclude` to combine different HTML files (more on that below). QuickConcat can also be used manually to combine JavaScript and stylesheet references in your document. For example, a site using Enhance might start by including `enhance.js` and `enhance.config.js` like so:

    <script src="/_js/lib/enhance.js,/_js/enhance.config.js"></script>

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

Wrap is a simple framework of DOM utilities that is designed to target modern browsers without failing the rest. 

Wrap is aimed particularly at cases where you need a small set of JS utilities but not a full toolkit. It's a throwback to the days of using a simple set of utilities that you need, and nothing more, but it's "wrapped" in a handy API.

Within the Southstreet workflow at Filament Group, we would use Wrap on for enhancing the user experience by manipulating markup, making Ajax requests, and any other common tasks one would do when using an unobtrusive JavaScript DOM framework.

Wrap is inspired by the jQuery API, letting you find elements and manipulate them. However, Wrap is written in such a way that it'll only do anything at all in modern browsers, like Internet Explorer 8 and up. Other browsers? They'll get a less-enhanced experience. There won't be errors, but there may be less _zing_. Assuming you're already building applications with Progressive Enhancement, you should be fine without JavaScript enhancements. In that way, jQuery and Wrap have dramatically different aims regarding support: jQuery works pretty much anywhere, and is fault-tolerant to infinite levels of developer happiness... Wrap: not so much. It only supports a subset of the nice things jQuery does, and almost that entire subset is optional. That combined with its browser support qualifications allow it to be a very small library, ideal – we find – for cross-device progressive enhancement.

Wrap is currently in private development but will likely be made public soon. 


## AjaxInclude

[AjaxInclude](https://github.com/filamentgroup/ajaxinclude), the final tool in our Progressive Enhancement stack, shapes the way we think about content and document construction in a major way. AjaxInclude uses the jQuery (or Wrap if you don't otherwise need jQuery) API to bring the concept of an "include" to HTML, allowing us to deliver lightweight web pages that contain only the most essential content, and lazy-loading additional content automatically via JavaScript.

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

## AppendAround

[AppendAround](https://github.com/filamentgroup/AppendAround) is a CSS and JavaScript pattern for achieving source-order-independent layouts today. It allows us to physically move an element to different locations in a document depending on CSS breakpoints in a responsive layout. It's a way to achieve CSS flexbox-like layout in browsers today.

## Picturefill

[Picturefill](https://github.com/filamentgroup/picturefill/tree/div-markup), while listed last in the Southstreet lineup is perhaps the most critical piece of all with regards to optimization. When serving content images in HTML, developers have no native options in 
HTML to deliver a context-appropriate image size, and that limitation requires us to apply server-based workarounds, or swap images with JavaScript and potentially load more than we need on many devices. Recently, Filament Group (and in particular, our own Mat Marquis), has led the charge in the creation of a new HTML element to solve this dilemma. How this element will take shape in a future spec is still being discussed, so in the interim, we have Picturefill. 

Picturefill was originally developed to match a proposed `picture` element's behavior, but since the `picture` element is currently - and potentially will always be - non-standard, we have developed a `div`-based approach that we'd recommend for use today. 

Picturefill allows us to reference several sources for a particular image in an HTML document, and based on which source's media query matches, Picturefill will load only one image appropriate to that context (and reevaluate whenever the viewport dimensions change as well).


## Wrap-up

The tools above combine to form the backbone of the Southstreet workflow. Now that you understand the foundations, seeing it all in action should bring additional clarity. This repository includes a demo ([_demo.html](https://github.com/filamentgroup/enhance/blob/master/_demo.html)) that uses "Enhance" and "QuickConcat" to conditionally load a set of JavaScript and CSS files. If you check out the repo and run it on a web server, you'll get the full effect. We'll look to improve the demo further to utilize Wrap and AjaxInclude as well soon, but this should give you a good idea of how things can work.

