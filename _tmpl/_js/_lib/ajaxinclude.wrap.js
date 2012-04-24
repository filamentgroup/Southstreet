/*! Ajax-include pattern. Copyright 2012, Scott Jehl, Filament Group, Inc. Dual licensed under MIT and GPLv2 */
/*
  * Original idea by Scott Gonzalez :)
  * To use, place attributes on content, pointing to a URL
    * that should either replace, or insert before or after that anchor
    * after the page has loaded
    * Replace:	<a href="..." data-replace="articles/latest/fragment">Latest Articles</a>
    * Before:	<a href="..." data-before="articles/latest/fragment">Latest Articles</a>
    * After:	<a href="..." data-after="articles/latest/fragment">Latest Articles</a>
    * Also, the data-threshold attr allows a min width for this to apply.
    * After domready, you can use it like this: 
         $("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude();
*/
(function( $ ){
	$.fn.ajaxInclude = function( proxy ) {
		
		var filelist = [],
			els = this;
		
		return this.each(function( k ) {
			var el			= $( this ),
				target		= el.data( "target" ),
				targetEl	= target && $( target ) || el,
				threshold	= screen.width > parseFloat( el.data( "threshold" ) || 0 ),
				methods		= [ "append", "replace", "before", "after" ],
				method,
				url;

			if ( threshold ) {

				for( var ml = methods.length, i=0; i < ml; i++ ){
					if( el.is( "[data-" + methods[ i ] + "]" ) ){
						method	= methods[ i ];
						url		= el.attr( "data-" + method );
					}
				}

				if( method === "replace" ){
					method += "With";
				}

				if( url && method ){
					
					el
						.data( "method", method )
						.data( "url", url )
						.bind( "ajaxInclude", function(e, data){
							var content = $(data);
							
							if( $(this).data( "proxy" ) ){
								content = content.filter( "entry[url=\"" + $(this).data( "url" ) + "\"]" );
							}
							$( this )[ $(this).data( "method" ) ]( content );	
						});
					
					if( proxy ){
						
						el.data( "proxy", proxy );
						
						if( $.inArray( url, filelist ) === -1 ){
							filelist.push( url );
						}
						
						if( k === els.length - 1 ){
							url = proxy + filelist.join();
						}
					}
					
					if( !proxy || k === els.length-1 ){
						$.get( url, function( data ) {	
							els.trigger( "ajaxInclude", [data] );
						});
					}
				}

			}
		});
	};
})( wrap );
