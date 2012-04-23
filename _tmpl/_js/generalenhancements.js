// NOTE: the real contents of this file would actually do something useful.
// for demo purposes, it logs a message to the page.
(function( $ ){
	// when dom is ready...
	$(function(){
		$( "<p class='general'>generalenhancements.js was loaded because it is meant for all enhanced browsers.</p>" ).appendTo( "body" );
		
		// trigger ajaxIncludes
		$( "[data-append],[data-replace],[data-after],[data-before]" ).ajaxInclude( "quickconcat.php?wrap&files=" );
	});
})( wrap );