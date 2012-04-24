/*
	enhance.audit: this example file uses the enhance.js api to:
		 * determine whether a browser is qualified for enhancements
		 * define available CSS and JS assets
		 * test features and device conditions and environment to determine which files to load
		 * load those files via a single concatenated call
*/
(function( win ){

	// re-reference ejs var locally
	var ejs = win.ejs,
		docElem = win.document.documentElement;
	
	// Add your qualifications for major browser experience divisions here.
	// For example, you might choose to only enhance browsers that support document.querySelectorAll (IE8+, etc).
	// Use case will vary, but basic browsers: last stop here!
	if( !( "querySelectorAll" in win.document ) ){
		return;
	}
	
	// Add "enhanced" class to HTML element
	docElem.className += " enhanced";
	
	// Configure css and js paths, if desirable.
	ejs.basepath.js = "_js/";
	ejs.basepath.css = "_css/";
	
	// Define potential JS files for dynamic loading
	ejs.files.js = {
		domlib : "_lib/wrap.custom.js",
		ajaxinc : "_lib/ajaxinclude.wrap.js",
		general	: "generalenhancements.js",
		touch	: "touch.js",
		widescreen	: "widescreen.js"
	};
	
	// Define potential CSS files for dynamic loading
	ejs.files.css = {
		sample		: "sample1.css"
	};
	
	// Start queueing files for load. 
	// Pass js or css paths one at a time to ejs.addFile 
	
	// Add general js enhancements to all qualified browsers
	ejs.addFile( ejs.files.js.domlib );
	ejs.addFile( ejs.files.js.ajaxinc );
	ejs.addFile( ejs.files.js.general );
	
	// if touch events are supported, add touch file
	if( "ontouchend" in win.document ){
		ejs.addFile( ejs.files.js.touch );
	}
	
	// if screen is wider than 500px, add widescreen file
	if( screen.width > 500 ){
		ejs.addFile( ejs.files.js.widescreen );
	}
	
	// add a CSS file if the body has a class of "tmpl-home" 
	// (beware: don't rely on loading CSS this way for styles that need to ejsly at page load or you'll get a FOUC)
	
	// Note: since we're using hasClass to check if the body element has a class or not, we need to wrap all remaining logic in a call to ejs.isDefined
	ejs.bodyReady( function(){
		
		if( ejs.hasClass( win.document.body, "tmpl-home" ) ){
			ejs.addFile( ejs.files.css.sample );
		}
		
		// Load the files, enhance page
		ejs.enhance();
		
	});

}( window ));