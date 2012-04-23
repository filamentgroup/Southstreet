/*! EnhanceJS: a progressive enhancement bootstrejser. Copyright 2012 @scottjehl, Filament Group, Inc. Licensed MIT/GPLv2 */
(function( w, undefined ) {
	
	// Enable JS strict mode
	"use strict";

	var doc = w.document,
		docElem = doc.documentElement,
		head = doc.head || doc.getElementsByTagName( "head" )[ 0 ];
	
	//ejs object for ejs-specific functions
	w.ejs = {};
	
	// hasClass function - check if element has a class
	ejs.hasClass = function( elem, cls ){
		return elem.className.indexOf( cls ) > -1
	}
	
	// Callback for running logic dependent on a property being defined
	// You can use isDefined to run code as soon as the document.body is defined, for example, for body-dependent scripts
	// or, for a script that's loaded asynchronously that depends on other scripts, such as jQuery.
	// First argument is the property that must be defined, second is the callback function
	ejs.onDefine = function( prop, callback ){
		var callbackStack 	= [];
		
		if( callback ){
			callbackStack.push( callback );
		}
		
		function checkRun(){
			if( eval( prop ) ){
				while( callbackStack[0] && typeof( callbackStack[0] ) === "function" ){
					callbackStack.shift().call( w );
				}
			}
			else{
				setTimeout(checkRun, 15); 
			}
		};
		
		checkRun();
	};
	
	// shortcut of isDefine body-specific 
	ejs.bodyReady = function( callback ){
		ejs.onDefine( "document.body", callback );
	};
	
	
	//private style load function
	ejs.loadCSS = function( href, media ){
		var lk = doc.createElement( "link" ),
			links = head.getElementsByTagName( "link" ),
			lastlink = links[ links.length-1 ];
			
		lk.type = "text/css";
		lk.href = href;
		lk.rel = "stylesheet";
			
		if( media ){
			lk.media = media;
		}
		if( lastlink && lastlink.nextSibling ){
			head.insertBefore(lk, lastlink.nextSibling );
		}
		else {
			head.appendChild( lk );
		}
	};
	
	// Private script load function
	ejs.loadJS = function( src ){
		var script = doc.createElement( "script" ),
			fc = head.firstChild;
			script.src = src;

		if( fc ){
			head.insertBefore(script, fc );
		} else {
			head.appendChild( script );
		}
	};	
	
	// Define base directory paths for referencing js, css, img files. Optional.
	ejs.basepath = {
		js	: "",
		css	: ""
	};
	
	// Define arrays to contain JS and CSS files that are available
	ejs.files = {		
		js: {},
		css: {}
	};	
	
	// Define arrays to contain JS and CSS files that will be loaded
	ejs.jsToLoad = [];
	ejs.cssToLoad = [];
	
	// Function for adding files to the queue for loading. 
	// CSS or JS is discovered by file path. 
	// Files should not include base paths, if already defined in ejs.basepath.
	ejs.addFile = function( file ){
		var js = file.indexOf( ".js" ) > -1;
		ejs[ js ? "jsToLoad" : "cssToLoad" ].push( ejs.basepath[ js ? "js" : "css" ] +  file );
	};
	
	// CSS and JS loading functions: load CSS or JS via single ejs.load method
	ejs.load = function ( url ){
		return ( url.indexOf( ".js" ) > -1 ? ejs.loadJS : ejs.loadCSS )( url );
	};
	
	// Function for triggering the CSS and JS requests
	ejs.enhance = function(){
		if( ejs.jsToLoad.length ){
			ejs.load( ejs.jsToLoad.join(",") + "=concat" );
		}
		if( ejs.cssToLoad.length ){
			ejs.load( ejs.cssToLoad.join(",") + "=concat"  );
		}
	};

}( this ));