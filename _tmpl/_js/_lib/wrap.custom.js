/*! wrap - a simple framework for DOM utilities, targeting modern browsers without failing the rest. Copyright 2012 @scottjehl, Filament Group, Inc. Licensed MIT/GPLv2 */
(function( w, undefined ){
	
	"use strict";
	
	var doc = w.document,
		wrap = function( prim, sec ){
		
			var pType = typeof( prim ),
				ret = [];
				
			if( prim ){
				// if string starting with <, make html
				if( pType === "string" && prim.indexOf( "<" ) === 0 ){
					var dfrag = document.createElement( "div" );
					dfrag.innerHTML = prim;
					return wrap( dfrag ).children().each(function(){
						dfrag.removeChild( this );
					});
				}
				else if( pType === "function" ){
					return wrap.ready( prim );
				}
				// if string, it's a selector, use qsa
				else if( pType === "string" ){
					if( sec ){
						return wrap( sec ).find( prim );
					}
					for( var i = 0, sel = doc.querySelectorAll( prim ), il = sel.length; i < il; i++ ){
						ret[ i ] = sel[ i ];
					}
				}
				// object? passthrough
				else {
					ret = ret.concat( prim );
				}
			}
			// if no prim, return a wrapped doc
			else{
				ret.push( doc );
			}
		
			ret = wrap.extend( ret, wrap.fn );
		
			return ret;
		};
	
	// For adding element set methods
	wrap.fn = {};
	
	// Public each method
	// For iteration on sets
	wrap.fn.each = function( fn ){
		for( var i = 0, il = this.length; i < il; i++ ){
			fn.call( this[ i ], i );
		}
		return this;
	};
	
	// For contextual lookups
	wrap.fn.find = function( sel ){
		var ret = [],
			finds;
		this.each(function(){
			finds = this.querySelectorAll( sel );
			for( var i = 0, il = finds.length; i < il; i++ ){
				ret = ret.concat( finds[i] );
			}
		});
		return wrap( ret );
	};
	
	// Children - get element child nodes.
	// This is needed for HTML string creation
	wrap.fn.children = function(){
		var ret = [],
			childs,
			j;
		this.each(function(){
			childs = this.children,
			j = -1;
		
			while( j++ < childs.length-1 ){
				if( !wrap.inArray( ret, childs[ j ] ) ){
					ret.push( childs[ j ] );
				}
			}
		});
		return wrap(ret);
	};
	
	// Public non-dom utilities
	
	// browser support qualifier - wrap any usage of wrap in a qualify callback
	wrap.qualified = "querySelectorAll" in doc;
	
	wrap.qualify = function( callback ){
		if( callback && wrap.qualified ){
			return callback();
		}
		// return support bool if there's no callback
		else if( !callback ){
			return wrap.qualified;
		}
	};
	
	// For extending objects
	wrap.extend = function( first, second ){
		for( var i in second ){
			if( second.hasOwnProperty( i ) ){
				first[ i ] = second[ i ];
			}
		}
		return first;
	};
	
	// check if an item exists in an array
	wrap.inArray = function( haystack, needle ){
		var isin = false;
		for( var i in haystack ){
			if( haystack.hasOwnProperty( i ) && haystack[ i ] === needle ){
				isin = true;
			}
		}
		return isin;
	};
	
	// For DOM ready execution
	wrap.ready = function( fn ){
		if( ready && fn && wrap.qualified ){
			fn.call( document );
		}
		else if( fn && wrap.qualified ){
			readyQueue.push( fn );
		}
		else {
			runReady();
		}
		
		return [doc];
	};
	
	// non-shortcut ready
	wrap.fn.ready = function( fn ){
		wrap.ready( fn );
		return this;
	};
	
	// Empty and exec the ready queue
	var ready = false,
		readyQueue = [],
		runReady = function(){
			if( !ready ){
				while( readyQueue.length ){
					readyQueue.shift().call( document );
				}
				ready = true;
			}
		};
	
	// Quick IE8 shiv
	if( !w.addEventListener ){
		w.addEventListener = function( evt, cb ){
			return w.attachEvent( "on" + evt, cb );
		};
	}
	
	// DOM ready
	w.addEventListener( "DOMContentLoaded", runReady, false );
	w.addEventListener( "readystatechange", runReady, false );
	w.addEventListener( "load", runReady, false );
	// If DOM is already ready at exec time
	if( doc.readyState === "complete" ){
		runReady();
	}
	
	// expose
	w.wrap = wrap;

})( this );// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	window.$ = wrap;
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	
	var xmlHttp = (function() {
		var xmlhttpmethod = false;	
		try {
			xmlhttpmethod = new XMLHttpRequest();
		}
		catch( e ){
			xmlhttpmethod = new ActiveXObject( "Microsoft.XMLHTTP" );
		}
		return function(){
			return xmlhttpmethod;
		};
	})();
	
	wrap.ajax = function( url, options ) {
		var req = xmlHttp(),
		settings = wrap.ajax.settings;
		
		if( options ){
			wrap.extend( settings, options );
		}
		if( !url ){
			url = settings.url;
		}
		
		if( !req || !url ){
			return;
		}	
		
		req.open( settings.method, url, settings.async );
		
		req.onreadystatechange = function () {
			if ( req.readyState !== 4 || req.status !== 200 && req.status !== 304 ){
				return settings.error( req.responseText, req.status, req );
			}
			settings.success( req.responseText, req.status, req );
		}
		if( req.readyState === 4 ){
			return;
		}

		req.send( null );
	};
	
	wrap.ajax.settings = {
		success: function(){},
		error: function(){},
		method: "GET",
		async: true,
		data: null
	};
})();// Extensions
(function( undefined ){
	wrap.get = function( url, callback ){
		return wrap.ajax( url, { success: callback } );
	};
})();// Extensions
(function( undefined ){
	wrap.fn.load = function( url, callback ){
		var self = this,
			args = arguments,
			intCB = function( data ){
				self.each(function(){
					wrap( this ).html( data );
				});
				if( callback ){
					callback.apply( self, args );
				}
		};
		wrap.ajax( url, { success: intCB } );
		return this;
	};
})();// Extensions
(function( undefined ){
	wrap.post = function( url, data, callback ){
		return wrap.ajax( url, { data: data, method: "POST", success: callback } );
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.data = function( name, val ){
		if( name !== undefined ){
			if( val !== undefined ){
				return this.each(function(){
					if( !this.wrapData ){
						this.wrapData = {};
					}
					this.wrapData[ name ] = val;
				});
			}
			else {
				return this[ 0 ].wrapData && this[ 0 ].wrapData[ name ];
			}
		}
		else {
			return this[ 0 ].wrapData;
		}
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.removeData = function( name ){
		return this.each(function(){
			if( name !== undefined && this.wrapData ){
				this.wrapData[ name ] = undefined;
				delete this.wrapData[ name ];
			}
			else {
				this[ 0 ].wrapData = {};
			}
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.addClass = function( cname ){
		return this.each(function(){
			this.className += " " + cname;
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.after = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = wrap( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				var insertEl = i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ];
				this.parentNode.insertBefore( insertEl, this );
				this.parentNode.insertBefore( this, insertEl );
			}
		});
	};
	
	wrap.fn.insertAfter = function( sel ){
		return this.each(function(){
			wrap( sel ).after( this );
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.append = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = wrap( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				this.appendChild( i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ] );
			}
		});
	};
	
	wrap.fn.appendTo = function( sel ){
		return this.each(function(){
			wrap( sel ).append( this );
		});
	};
	
})();// Extensions
(function( undefined ){
	wrap.fn.attr = function( name, val ){
		var nameStr = typeof( name ) === "string";
		if( val !== undefined || !nameStr ){
			return this.each(function(){
				if( nameStr ){
					this.setAttribute( name, val );
				}
				else {
					for( var i in name ){
						if( name.hasOwnProperty( i ) ){
							this.setAttribute( i, name[ i ] );
						}
					}
				}
			});
		}
		else {
			return this[ 0 ].getAttribute( name );
		}
	};
})();// Extensions
(function( undefined ){
	wrap.fn.before = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = wrap( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				this.parentNode.insertBefore( i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ], this );
			}
		});
	};
	
	wrap.fn.insertBefore = function( sel ){
		return this.each(function(){
			wrap( sel ).before( this );
		});
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.eq = function( num ){
		return wrap( this[ num ] );
	};
})();// Extensions
(function( undefined ){
	wrap.fn.filter = function( sel ){
		var ret = [],
			wsel =  wrap( sel );

		this.each(function(){
			
			if( !this.parentNode ){
				var context = wrap( document.createDocumentFragment() );
				context[ 0 ].appendChild( this );
				wsel = wrap( sel, context );
			}
			
			if( wrap.inArray( wsel, this ) ){
				ret.push( this );				
			}
		});

		return wrap( ret );
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.get = function( num ){
		return this[ num ];
	};
})();// Extensions
(function( undefined ){
	wrap.fn.html = function( html ){
		if( html ){
			return this.each(function(){
				this.innerHTML = html;
			});
		}
		else{
			var pile = "";
			return this.each(function(){
				pile += this.innerHTML;
			});
			return pile;
		}
	};
})();// Extensions
(function( undefined ){
	wrap.fn.is = function( sel ){
		var ret = false,
			sel = wrap( sel );
		this.each(function( i ){
			if( wrap.inArray( sel, this ) ){
				ret = true;				
			}
		});
		return ret;
	};
})();// Extensions
(function( undefined ){
	wrap.fn.next = function(){
		var ret = [],
			next;
		this.each(function( i ){
			next = this.nextElementSibling;
			if( next ){
				ret = ret.concat( next );
			}
		});
		return wrap(ret);
	};
})();// Extensions
(function( undefined ){
	wrap.fn.not = function( sel ){
		var ret = [],
			sel = wrap( sel );
		this.each(function( i ){
			if( !wrap.inArray( sel, this ) ){
				ret.push( this );				
			}
		});
		return wrap( ret );
	};
})();// Extensions
(function( undefined ){
	wrap.fn.parent = function(){
		var ret = [],
			parent;
		this.each(function(){
			parent = this.parentElement;
			if( parent ){
				ret.push( parent );
			}
		});
		return wrap(ret);
	};
})();// Extensions
(function( undefined ){
	wrap.fn.parents = function( sel ){
		var ret = [];
		
		this.each(function(){
			var curr = this,
				match;
			while( curr.parentElement && !match ){
				curr = curr.parentElement;
				if( sel ){
					if( curr === wrap( sel )[0] ){
						match = true;
						if( !wrap.inArray( ret, curr ) ){
							ret.push( curr );
						}
					}
				}
				else {
					if( !wrap.inArray( ret, curr ) ){
						ret.push( curr );
					}
				}				
			}
		});
		return wrap(ret);
	};
})();// Extensions
(function( undefined ){
	wrap.fn.closest = function( sel ){
		var ret = [];
		if( !sel ){
			return wrap( ret );
		}
		
		this.each(function(){
			var self = this,
				generations = 0;
				
			wrap( sel ).each(function(){
				if( self === this ){
					ret[ 0 ] = self;
				}
				else {
					var i = 0;
					while( self.parentElement && ( !generations || i < generations ) ){
						i++;
						if( self.parentElement === this ){
							ret[ 0 ] = self.parentElement;
							generations = i;
						}
						else{
							self = self.parentElement;
						}
					}
				}
			});
		});
		return wrap( ret );
	};
})();// Extensions
(function( undefined ){
	wrap.fn.prepend = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = wrap( frag );
		}
		return this.each(function( i ){
			
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				var insertEl = i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ];
				if ( this.firstChild ){
					this.insertBefore( insertEl, this.firstChild );
				}
				else {
					this.appendChild( insertEl );
				}
			}
		});
	};
	
	wrap.fn.prependTo = function( sel ){
		return this.each(function(){
			wrap( sel ).prepend( this );
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.prev = function(){
		var ret = [],
			next;
		this.each(function( i ){
			next = this.previousElementSibling;
			if( next ){
				ret = ret.concat( next );
			}
		});
		return wrap(ret);
	};
})();// Extensions
(function( undefined ){
	wrap.fn.prop = function( name, val ){
		var name = wrap.propFix[ name ] || name;
		if( val !== undefined ){
			return this.each(function(){
				this[ name ] = val;
			});
		}
		else {
			return this[ 0 ][ name ];
		}
	};
	
	// Property normalization, a subset taken from jQuery src
	wrap.propFix = {
		"class": "className",
		contenteditable: "contentEditable",
		"for": "htmlFor",
		readonly: "readOnly",
		tabindex: "tabIndex"
	}
})();// Extensions
(function( undefined ){
	wrap.fn.removeProp = function( prop ){
		var name = wrap.propFix && wrap.propFix[ name ] || name;
		return this.each(function(){
			this[ prop ] = undefined;
			delete this[ prop ];
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.remove = function( sel ){
		return this.each(function(){
			this.parentNode.removeChild( this );
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.removeAttr = function( attr ){
		return this.each(function(){
			this.removeAttribute( attr );
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.removeClass = function( cname ){
		return this.each(function(){
			this.className = this.className.replace( new RegExp( cname, "gmi" ), "" );
		});
	};
})();// Extensions
(function( undefined ){
	wrap.fn.replaceWith = function( frag ){
		if( typeof( frag ) === "string" ){
			frag = wrap( frag );
		}
		var ret = [];
		this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				var insertEl = i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ];
				this.parentNode.insertBefore( insertEl, this );
				insertEl.parentNode.removeChild( this );
				ret.push( insertEl );
			}
		});
		return wrap( ret );
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.bind = function( evt, callback ){
		return this.each(function(){
			
			var cb = function( e ){
				callback.apply( this, [ e ].concat( e.args || [] )  );
			};
			
			if( "addEventListener" in this ){
				this.addEventListener( evt, cb, false );
			}
			else if( this.attachEvent ){
				this.attachEvent( "on" + evt, cb );
			}
		});
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.live = function( evt, callback ){
		return this.each(function(){
			
			var self = this;
		
			function newCB( event ){
				if( event.target === self ){
					callback.apply( self, [ e ].concat( event.args || [] ) );
				}
			}
			
			if( "addEventListener" in document ){
				document.addEventListener( evt, newCB, false );
			}
			else if( document.attachEvent ){
				document.attachEvent( "on" + evt, newCB );
			}
		});
	};
})();// Extensions

// keep this wrapper around the ones you use!
(function( undefined ){
	wrap.fn.trigger = function( evt, args ){
		return this.each(function(){
			// TODO needs IE8 support
			if( document.createEvent ){
				var event = document.createEvent( "Event" );
				event.initEvent( evt, true, true );
				event.args = args;
				this.dispatchEvent( event );
			}
		});
	};
})();