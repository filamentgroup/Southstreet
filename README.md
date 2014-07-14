# SouthStreet Workflow

[![Filament Group](http://filamentgroup.com/images/fg-logo-positive-sm-crop.png) ](http://www.filamentgroup.com/)

## Our tools and workflow for building fast and accessible cross-device web applications

SouthStreet is a set of tools that combine to form the progressive enhancement workflow we use on projects at [Filament Group](http://filamentgroup.com). This workflow is designed to help us deliver modern web experiences that are accessible to the widest range of devices possible.

While we have [many open-source projects related to cross-device usability](http://filamentgroup.com/code/), SouthStreet is focused particularly on the process of delivering enhancements efficiently so that users receive a page that works as soon as possible.

Our SouthStreet workflow utilizes the following tools, all of which are independent Github projects themselves.  

- [Enhance](https://github.com/filamentgroup/enhance): a small JavaScript boilerplate designed to help determine if a browser is capable of handling additional user interface enhancements, and load specific enhancements for that browser as fast and simply as possible.
- [loadCSS](https://github.com/filamentgroup/loadCSS): A function for loading CSS asynchronously.
- [loadJS](https://github.com/filamentgroup/loadJS): A function for loading JS asynchronously.
- [cookie](https://github.com/filamentgroup/cookie): Get, set, or forget cookies.
- [criticalCSS](https://github.com/filamentgroup/criticalcss/): A command-line tool for extracting critical CSS for a page. (we use this with [grunt-criticalCSS](https://github.com/filamentgroup/grunt-criticalcss/))
- [AjaxInclude](https://github.com/filamentgroup/Ajax-Include-Pattern/): a plugin that is designed for modular content construction, that runs on jQuery (or our yet-to-be released Shoestring DOM utility)
- [Picturefill](https://github.com/scottjehl/picturefill/): A responsive images polyfill.

Together these tools form the core of Filament Group's progressive enhancement workflow. The scope of these individual projects vary widely, but they all share a common goal of serving front-end code faster, either by preventing or deferring the loading of code and assets that are not essential to the device, or by offering light-weight alternatives to common patterns. 

For demonstration purposes, the [Demo page](http://filamentgroup.github.io/Southstreet/demo.html) of this repository contains a working example of these tools working together.

Please note that while these tools do represent key components of our overall approach, their applicability to a particular project always varies, and these particular projects are not always the best tool for the job at hand. Depending on whether a particular tool makes sense for the problem we're solving, we will often use alternative tools that provide similar functionality instead. For example, we commonly use jQuery instead of Shoestring (below), as Shoestring provides a small subset of jQuery's featureset, and is not always appropriate for the needs of our projects. In essence, the projects in SouthStreet are developed with a goal of ease of use and compatibility, but they should always be evaluated against other potential solutions. 

Let's break down the role that each one plays.

## Initial Page Load Tools

The following SouthStreet tools are used in the initial page load step.

## Enhance (v2)

[Enhance](https://github.com/filamentgroup/enhance) is a tiny JavaScript boilerplate designed to help developers keep overhead low while delivering enhancements to differing devices and device categories. Technically speaking, the role of Enhance is to determine if a browser is broadly capable of handling additional JavaScript and CSS enhancements, and then load specific enhancements for that browser as fast and simply as possible. Enhance is designed to be delete-key-friendly, but it includes a few other SouthStreet projects inside it for convenience (namely, [loadCSS](https://github.com/filamentgroup/loadCSS), [loadJS](https://github.com/filamentgroup/loadJS), and [cookie](https://github.com/filamentgroup/cookie)).

Typically, a site that uses Enhance will start by including `enhance.js` directly in the `head` of the page -inline, not an external reference. Within `enhance.js`, the following steps are often taken:

1. Define some variables and functions for loading assets and accessing information about the browser and markup
2. Run one or more tests to see if a browser is qualified to load and render additional enhancements
3.   
	- A. If it's not qualified, exit early and do nothing more
	- B. If it is qualified, proceed on to load additional assets, add classes to the document, etc.


For an example of how this process actually breaks down in JavaScript, check out the `enhance.js` file in this repository.

## CriticalCSS
Critical CSS is a task we typically run during a build process. We use the task to evaluate every unique template in a site to determine the subset of styles in a site's CSS that are necessary to render the top portion of the page. As these styles are determined, we write them to files that are intended to be included directly in the `head` of each template, on the server-side. Inlining only these most critical of styles allows us to avoid making render-blocking requests from the `head` of the page, which dramatically increase the time it takes for a page to be usable. Once included in a template, we use EnhanceJS to request the rest of the site's CSS in a single request, and to set a cookie that tells the server on subsequent visits that the full CSS file is most likely cached now and can be referenced from the head of the page (instead of inline styles).

Inlining CSS this way is designed to optimize the first visit to any page on a site, aiming to render a usable page in less than a second on a modern connection. It follows the recommendations from Google's Pagespeed Insights. Check out [our own site's score on PSI](https://developers.google.com/speed/pagespeed/insights/?url=filamentgroup.com) to see how well it works in action.

For examples of how we recommend configuring the `head` of a page to use EnhanceJS and CriticalCSS together, check out [the EnhanceJS readme](https://github.com/filamentgroup/enhance#how-to-use), or explore the demo files in this project.


# Secondary Enhancement JavaScript Files

The following SouthStreet scripts are typically loaded in a qualified manner by EnhanceJS, after bundling them in a single file amongst any other scripts we may need. These are part of SouthStreet purely because they serve the purpose of facilitating further enhancements to a page (by fetching assets conditionally).

## AjaxInclude

[AjaxInclude](https://github.com/filamentgroup/Ajax-Include-Pattern) shapes the way we think about content and document construction in a major way. AjaxInclude uses the jQuery (or our not-yet-public Shoestring if you don't otherwise need jQuery) API to bring the concept of an "include" to HTML, allowing us to deliver lightweight web pages that contain only the most essential content, and lazy-loading additional content automatically via JavaScript.

AjaxInclude works by referencing external fragments of HTML content via HTML5 data attributes. For example:

    <a href="articles/latest/" data-before="articles/latest/fragment">Latest Articles</a>

In this case, we have an ordinary link to external content, which is essential for accessibility across all devices, but the link is also tagged with a `data-before` attribute that references a URL that contains a fragment of that external content to pull into the page. The AjaxInclude plugin will see this and include that content _before_ the link.

You can add these attributes to elements in your page anywhere non-essential fragments of content can be included from an external URL. jQuery-api-like qualifiers like `data-after`, `data-before`, `data-append`, and `data-replace` are all supported. Also, the `data-threshold` attr allows a min width for this to apply.

Note: these attributes can be placed on any element, not just anchors. You might find `data-append` to be most useful on container elements.

Once the DOM is ready, you can apply the plugin like this: 

    $("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude();
	

## Picturefill

[Picturefill](https://github.com/scottjehl/picturefill/), while listed last in the SouthStreet lineup is one of the most critical pieces of all with regards to delivery optimization. 
Picturefill allows us to reference several sources for a particular image in an HTML document, and based on which source's media query matches, Picturefill will load only one image appropriate to that context (and reevaluate whenever the viewport dimensions change as well).


## Recap

The tools above combine to form the backbone of the SouthStreet workflow. Now that you understand the foundations, seeing it all in action should bring additional clarity. This repository includes a demo ([_demo.html](https://github.com/filamentgroup/enhance/blob/master/_demo.html)) that uses "Enhance" and "QuickConcat" to conditionally load a set of JavaScript and CSS files. If you check out the repo and run it on a web server, you'll get the full effect. We'll look to improve the demo further to utilize Shoestring and AjaxInclude as well soon, but this should give you a good idea of how things can work.

You can find more projects at our website as well. [Filament Group, Inc](http://filamentgroup.com/code)

