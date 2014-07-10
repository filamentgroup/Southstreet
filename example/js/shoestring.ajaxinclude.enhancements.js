/* Hi. This is an example concatenated file that contains a dom toolkit, ajax include, and a few DOM-ready calls.
It's here to represent the file we load in qualified browsers
*/

/*! Shoestring - v0.1.0 - 2014-05-28
* http://github.com/filamentgroup/shoestring/
* Copyright (c) 2014 Scott Jehl, Filament Group, Inc; Licensed MIT & GPLv2 */
(function( w, undefined ){
	var doc = w.document,
		shoestring = function( prim, sec ){

			var pType = typeof( prim ),
				ret = [];

			if( prim ){
				// if string starting with <, make html
				if( pType === "string" && prim.indexOf( "<" ) === 0 ){
					var dfrag = document.createElement( "div" );
					dfrag.innerHTML = prim;
					return shoestring( dfrag ).children().each(function(){
						dfrag.removeChild( this );
					});
				}
				else if( pType === "function" ){
					return shoestring.ready( prim );
				}
				// if string, it's a selector, use qsa
				else if( pType === "string" ){
					if( sec ){
						return shoestring( sec ).find( prim );
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

			ret = shoestring.extend( ret, shoestring.fn );

			// add selector prop
			ret.selector = prim;

			return ret;
		};

	// For adding element set methods
	shoestring.fn = {};

	// Public each method
	// For iteration on sets
	shoestring.fn.each = function( fn ){
		for( var i = 0, il = this.length; i < il; i++ ){
			fn.call( this[ i ], i );
		}
		return this;
	};

	// For contextual lookups
	shoestring.fn.find = function( sel ){
		var ret = [],
			finds;
		this.each(function(){
			finds = this.querySelectorAll( sel );
			for( var i = 0, il = finds.length; i < il; i++ ){
				ret = ret.concat( finds[i] );
			}
		});
		return shoestring( ret );
	};

	// Children - get element child nodes.
	// This is needed for HTML string creation
	shoestring.fn.children = function(){
		var ret = [],
			childs,
			j;
		this.each(function(){
			childs = this.children;
			j = -1;

			while( j++ < childs.length-1 ){
				if( shoestring.inArray(  childs[ j ], ret ) === -1 ){
					ret.push( childs[ j ] );
				}
			}
		});
		return shoestring(ret);
	};

	// Public non-dom utilities

	// browser support qualifier - shoestring any usage of shoestring in a qualify callback
	shoestring.qualified = "querySelectorAll" in doc;

	shoestring.qualify = function( callback ){
		if( callback && shoestring.qualified ){
			return callback();
		}
		// return support bool if there's no callback
		else if( !callback ){
			return shoestring.qualified;
		}
	};

	// For extending objects
	shoestring.extend = function( first, second ){
		for( var i in second ){
			if( second.hasOwnProperty( i ) ){
				first[ i ] = second[ i ];
			}
		}
		return first;
	};

	// check if an item exists in an array
	shoestring.inArray = function( needle, haystack ){
		var isin = -1;
		for( var i = 0, il = haystack.length; i < il; i++ ){
			if( haystack.hasOwnProperty( i ) && haystack[ i ] === needle ){
				isin = i;
			}
		}
		return isin;
	};

	// For DOM ready execution
	shoestring.ready = function( fn ){
		if( ready && fn && shoestring.qualified ){
			fn.call( document );
		}
		else if( fn && shoestring.qualified ){
			readyQueue.push( fn );
		}
		else {
			runReady();
		}

		return [doc];
	};

	// non-shortcut ready
	shoestring.fn.ready = function( fn ){
		shoestring.ready( fn );
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
	w.shoestring = shoestring;



	var xmlHttp = function() {
		try {
			return new XMLHttpRequest();
		}
		catch( e ){
			return new ActiveXObject( "Microsoft.XMLHTTP" );
		}
	};

	shoestring.ajax = function( url, options ) {
		var req = xmlHttp(),
			settings = shoestring.extend( {}, shoestring.ajax.settings );

		if( options ){
			shoestring.extend( settings, options );
		}
		if( !url ){
			url = settings.url;
		}

		if( !req || !url ){
			return;
		}

		req.open( settings.method, url, settings.async );

		if( req.setRequestHeader ){
			req.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
		}

		req.onreadystatechange = function () {
			if( req.readyState === 4 ){
				// Trim the whitespace so shoestring('<div>') works
				var res = (req.responseText || '').replace(/^\s+|\s+$/g, '');
				if( req.status.toString().indexOf( "0" ) === 0 ){
					return settings.cancel( res, req.status, req );
				}
				else if ( req.status.toString().match( /^(4|5)/ ) && RegExp.$1 ){
					return settings.error( res, req.status, req );
				}
				else {
					return settings.success( res, req.status, req );
				}
			}
		};

		if( req.readyState === 4 ){
			return req;
		}

		req.send( null );
		return req;
	};

	shoestring.ajax.settings = {
		success: function(){},
		error: function(){},
		cancel: function(){},
		method: "GET",
		async: true,
		data: null
	};



	shoestring.get = function( url, callback ){
		return shoestring.ajax( url, { success: callback } );
	};



	shoestring.fn.load = function( url, callback ){
		var self = this,
			args = arguments,
			intCB = function( data ){
				self.each(function(){
					shoestring( this ).html( data );
				});
				if( callback ){
					callback.apply( self, args );
				}
		};
		shoestring.ajax( url, { success: intCB } );
		return this;
	};



	shoestring.post = function( url, data, callback ){
		return shoestring.ajax( url, { data: data, method: "POST", success: callback } );
	};


// Extensions

// keep this wrapper around the ones you use!
	shoestring.fn.data = function( name, val ){
		if( name !== undefined ){
			if( val !== undefined ){
				return this.each(function(){
					if( !this.shoestringData ){
						this.shoestringData = {};
					}
					this.shoestringData[ name ] = val;
				});
			}
			else {
				return this[ 0 ].shoestringData && this[ 0 ].shoestringData[ name ];
			}
		}
		else {
			return this[ 0 ].shoestringData;
		}
	};
// Extensions

// keep this wrapper around the ones you use!
	shoestring.fn.removeData = function( name ){
		return this.each(function(){
			if( name !== undefined && this.shoestringData ){
				this.shoestringData[ name ] = undefined;
				delete this.shoestringData[ name ];
			}
			else {
				this[ 0 ].shoestringData = {};
			}
		});
	};

	window.$ = shoestring;



	shoestring.fn.addClass = function( cname ){
		var classes = cname.replace(/^\s+|\s+$/g, '').split( " " );
		return this.each(function(){
			for( var i = 0, il = classes.length; i < il; i++ ){
				if( this.className !== undefined && ( this.className === "" || !this.className.match( new RegExp( "(^|\\s)" + classes[ i ] + "($|\\s)" ) ) ) ){
					this.className += " " + classes[ i ];
				}
			}
		});
	};



	shoestring.fn.add = function( sel ){
		var ret = [];
		this.each(function(){
			ret.push( this );
		});

		shoestring( sel ).each(function(){
			ret.push( this );
		});

		return shoestring( ret );
	};



	shoestring.fn.after = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = shoestring( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				var insertEl = i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ];
				this.parentNode.insertBefore( insertEl, this.nextSibling );
			}
		});
	};

	shoestring.fn.insertAfter = function( sel ){
		return this.each(function(){
			shoestring( sel ).after( this );
		});
	};



	shoestring.fn.append = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = shoestring( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				this.appendChild( i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ] );
			}
		});
	};

	shoestring.fn.appendTo = function( sel ){
		return this.each(function(){
			shoestring( sel ).append( this );
		});
	};



	shoestring.fn.attr = function( name, val ){
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



	shoestring.fn.before = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = shoestring( frag );
		}
		return this.each(function( i ){
			for( var j = 0, jl = frag.length; j < jl; j++ ){
				this.parentNode.insertBefore( i > 0 ? frag[ j ].cloneNode( true ) : frag[ j ], this );
			}
		});
	};

	shoestring.fn.insertBefore = function( sel ){
		return this.each(function(){
			shoestring( sel ).before( this );
		});
	};



	shoestring.fn.clone = function() {
		var ret = [];
		this.each(function() {
			ret.push( this.cloneNode( true ) );
		});
		return $( ret );
	};



	shoestring.fn.is = function( sel ){
		var ret = false;
		this.each(function(){
			if( shoestring.inArray( this, shoestring( sel ) )  > -1 ){
				ret = true;
			}
		});
		return ret;
	};



	shoestring.fn.closest = function( sel ){
		var ret = [];
		if( !sel ){
			return shoestring( ret );
		}

		this.each(function(){
			var element, $self = shoestring( element = this );

			if( $self.is(sel) ){
				ret.push( this );
				return;
			}

			while( element.parentElement ) {
				if( shoestring(element.parentElement).is(sel) ){
					ret.push( this.parentElement );
					break;
				}

				element = element.parentElement;
			}
		});

		return shoestring( ret );
	};



	shoestring.fn.css = function( prop, val ){
		if( typeof prop === "object" ) {
			return this.each(function() {
				for( var key in prop ) {
					if( prop.hasOwnProperty( key ) ) {
						this.style[ key ] = prop[ key ];
					}
				}
			});
		}
		else {
			if( val !== undefined ){
				return this.each(function(){
					this.style[ prop ] = val;
				});
			}
			else {
				return window.getComputedStyle( this[ 0 ], null ).getPropertyValue( prop );
			}
		}
	};



	shoestring.fn.eq = function( num ){
		if( this[ num ] ){
			return shoestring( this[ num ] );
		}
		return shoestring([]);
	};



	shoestring.fn.filter = function( sel ){
		var ret = [],
			wsel =  shoestring( sel );

		this.each(function(){

			if( !this.parentNode ){
				var context = shoestring( document.createDocumentFragment() );
				context[ 0 ].appendChild( this );
				wsel = shoestring( sel, context );
			}

			if( shoestring.inArray( this, wsel ) > -1 ){
				ret.push( this );
			}
		});

		return shoestring( ret );
	};


  shoestring.fn.first = function(){
		return this.eq( 0 );
	};


	shoestring.fn.get = function( num ){
		return this[ num ];
	};



	shoestring.fn.height = function( num ){
		if( num === undefined ){
			return this[ 0 ].offsetHeight;
		}
		else {
			return this.each(function(){
				this.style.height = num;
			});
		}
	};



	shoestring.fn.html = function( html ){
		if( html ){
			return this.each(function(){
				this.innerHTML = html;
			});
		}
		else{
			var pile = "";
			this.each(function(){
				pile += this.innerHTML;
			});
			return pile;
		}
	};



	shoestring.fn.index = function( elem ){

		// no arg? return number of prev siblings
		if( elem === undefined ){
			var ret = 0,
				self = this[ 0 ];

			while( self.previousElementSibling !== null && self.previousElementSibling !== undefined ){
				self = self.previousElementSibling;
				ret++;
			}
			return ret;
		}
		else {
			// arg? get its index within the jq obj
			elem = shoestring( elem )[ 0 ];

			for( var i = 0; i < this.length; i++ ){
				if( this[ i ] === elem ){
					return i;
				}
			}
			return -1;
		}
	};



	shoestring.fn.last = function(){
		return this.eq( this.length - 1 );
	};



	shoestring.fn.next = function(){
		var ret = [],
			next;
		this.each(function(){
			next = this.nextElementSibling;

			if( next ){
				ret = ret.concat( next );
			}
		});
		return shoestring(ret);
	};



	shoestring.fn.not = function( sel ){
		var ret = [];
		this.each(function(){
			if( shoestring.inArray( this, shoestring( sel ) ) === -1 ){
				ret.push( this );
			}
		});
		return shoestring( ret );
	};



	shoestring.fn.offset = function(){
		return {
			top: this[ 0 ].offsetTop,
			left: this[ 0 ].offsetLeft
		};
	};



	shoestring.fn.parent = function(){
		var ret = [],
			parent;
		this.each(function(){
			parent = this.parentElement;
			if( parent ){
				ret.push( parent );
			}
		});
		return shoestring(ret);
	};



	shoestring.fn.parents = function( sel ){
		var ret = [];

		this.each(function(){
			var curr = this,
				match;
			while( curr.parentElement && !match ){
				curr = curr.parentElement;
				if( sel ){
					if( curr === shoestring( sel )[0] ){
						match = true;
						if( shoestring.inArray( curr, ret ) === -1 ){
							ret.push( curr );
						}
					}
				}
				else {
					if( shoestring.inArray( curr, ret ) === -1 ){
						ret.push( curr );
					}
				}
			}
		});
		return shoestring(ret);
	};



	shoestring.fn.prepend = function( frag ){
		if( typeof( frag ) === "string" || frag.nodeType !== undefined ){
			frag = shoestring( frag );
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

	shoestring.fn.prependTo = function( sel ){
		return this.each(function(){
			shoestring( sel ).prepend( this );
		});
	};



	shoestring.fn.prevAll = function(){
		var ret = [];
		this.each(function(){
			var self = this;
			while( self.previousElementSibling ){
				ret = ret.concat( self.previousElementSibling );
				self = self.previousElementSibling;
			}
		});
		return shoestring(ret);
	};



	shoestring.fn.prev = function(){
		var ret = [],
			next;
		this.each(function(){
			next = this.previousElementSibling;
			if( next ){
				ret = ret.concat( next );
			}
		});
		return shoestring(ret);
	};



	shoestring.fn.prop = function( name, val ){
		name = shoestring.propFix[ name ] || name;
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
	shoestring.propFix = {
		"class": "className",
		contenteditable: "contentEditable",
		"for": "htmlFor",
		readonly: "readOnly",
		tabindex: "tabIndex"
	};



	shoestring.fn.removeAttr = function( attr ){
		return this.each(function(){
			this.removeAttribute( attr );
		});
	};



	shoestring.fn.removeClass = function( cname ){
		var classes = cname.replace(/^\s+|\s+$/g, '').split( " " );

		return this.each(function(){
			for( var i = 0, il = classes.length; i < il; i++ ){
				if( this.className !== undefined ){
					this.className = this.className.replace( new RegExp( "(^|\\s)" + classes[ i ] + "($|\\s)", "gmi" ), " " );
				}
			}
		});
	};



	shoestring.fn.remove = function(){
		return this.each(function(){
			this.parentNode.removeChild( this );
		});
	};



	shoestring.fn.removeProp = function( prop ){
		var name = shoestring.propFix && shoestring.propFix[ name ] || name;
		return this.each(function(){
			this[ prop ] = undefined;
			delete this[ prop ];
		});
	};



	shoestring.fn.replaceWith = function( frag ){
		if( typeof( frag ) === "string" ){
			frag = shoestring( frag );
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
		return shoestring( ret );
	};



	shoestring.fn.serialize = function(){
		var data = {};
		shoestring( "input, select", this ).each(function(){
			var type = this.type,
				name = this.name,
				value = this.value;

			if( /text|hidden|password|color|date|datetime|datetime\-local|email|month|number|range|search|tel|time|url|week/.test( type ) || ( type === "checkbox" || type === "radio" ) && this.checked ){
				data[ name ] = value;
			}
			else if( this.nodeName === "select" ){
				data[ name ] = this.options[ this.selectedIndex ].nodeValue;
			}
		});
		return data;
	};



	shoestring.fn.siblings = function(){
		if( !this.length ) {
			return shoestring( [] );
		}

		var sibs = [],
			el = this[ 0 ].parentNode.firstChild;

		do {
			if( el.nodeType === 1 && el !== this[ 0 ] ) {
				sibs.push( el );
			}

      el = el.nextSibling;
		} while( el );

		return shoestring( sibs );
	};



	shoestring.fn.val = function( val ){
		if( val !== undefined ){
			return this.each(function(){
				if( this.tagName === "SELECT" ){
					var optionSet, option,
						options = elem.options,
						values = [],
						i = options.length,
						newIndex;

					values[0] = val;
					while ( i-- ) {
						option = options[ i ];
						if ( (option.selected = shoestring.inArray( option.value, values ) >= 0) ) {
							optionSet = true;
							newIndex = i;
						}
					}
					// force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					} else {
						elem.selectedIndex = i;
					}
				} else {
					this.value = val;
				}
			});
		}
		else {
			if( this.tagName === "SELECT" ){
				return this.options[ this[0].selectedIndex ].value;
			} else {
				return this[0].value;
			}
		}
	};



	shoestring.fn.width = function( num ){
		if( num === undefined ){
			return this[ 0 ].offsetWidth;
		}
		else {
			return this.each(function(){
				this.style.width = num;
			});
		}
	};



	shoestring.fn.wrapInner = function( html ){
		return this.each(function(){
			var inH = this.innerHTML;
			this.innerHTML = "";
			shoestring( this ).append( shoestring( html ).html( inH ) );
		});
	};



	shoestring.fn.bind = function( evt, callback ){
		var evts = evt.split( " " ),
			bindingname = callback.toString(),
			boundEvents = function( el, evt, callback ) {
				if ( !el.shoestringData ) {
					el.shoestringData = {};
				}
				if ( !el.shoestringData.events ) {
					el.shoestringData.events = {};
				}
				if ( !el.shoestringData.events[ evt ] ) {
					el.shoestringData.events[ evt ] = [];
				}
				el.shoestringData.events[ evt ][ bindingname ] = callback.callfunc;
			};

		function newCB( e ){
			return callback.apply( this, [ e ].concat( e._args ) );
		}
		function propChange( e, oEl ) {
			var el = document.documentElement[ e.propertyName ].el;

			if( el !== undefined && oEl === el ) {
				newCB.call( el, e );
			}
		}
		return this.each(function(){
			var callback, oEl = this;

			callback = function( e ) {
				propChange.call( this, e, oEl );
			};

			for( var i = 0, il = evts.length; i < il; i++ ){
				var evt = evts[ i ];

				if( "addEventListener" in this ){
					this.addEventListener( evt, newCB, false );
				} else if( this.attachEvent ){
					if( this[ "on" + evt ] !== undefined ) {
						this.attachEvent( "on" + evt, newCB );
					} else {
						// Custom event
						document.documentElement.attachEvent( "onpropertychange", callback );
					}
				}
				boundEvents( this, evts[ i ], { "callfunc" : newCB, "name" : bindingname });
			}
		});
	};



	shoestring.fn.on = function( evt, callback ){
		var evts = evt.split( " " ),
			sel = this.selector;

		function newCB( e ){
			shoestring( sel ).each(function(){
				if( e.target === this ){
					callback.apply( this, [ e ].concat( e._args ) );
				}
			});
		}

		for( var i = 0, il = evts.length; i < il; i++ ){
			if( "addEventListener" in document ){
				document.addEventListener( evts[ i ], newCB, false );
			}
			else if( document.attachEvent ){
				document.attachEvent( "on" + evts[ i ], newCB );
			}
		}
		return this;
	};

	shoestring.fn.live = shoestring.fn.on;



	shoestring.fn.one = function( evt, callback ){
		var evts = evt.split( " " );
		return this.each(function(){
			var cb;

			for( var i = 0, il = evts.length; i < il; i++ ){
				var thisevt = evts[ i ];
				if( "addEventListener" in this ){
					cb = function( e ){
						callback.apply( this, [ e ].concat( e._args ) );
						this.removeEventListener( thisevt, cb );
					};
					this.addEventListener( thisevt, cb, false );
				}
				else if( this.attachEvent ){
					cb = function( e ){
						callback.apply( this, [ e ].concat( e._args ) );
						this.detachEvent( "on" + thisevt, cb );
					};
					this.attachEvent( "on" + thisevt, cb );
				}
			}
		});
	};



	shoestring.fn.triggerHandler = function( evt, args ){
		var e = evt.split( " " )[ 0 ],
			el = this[ 0 ],
			ret;

		// TODO needs IE8 support
		if( document.createEvent && el.shoestringData && el.shoestringData.events && el.shoestringData.events[ e ] ){
			var bindings = el.shoestringData.events[ e ];
			for (var i in bindings ){
				if( bindings.hasOwnProperty( i ) ){
					var event = document.createEvent( "Event" );
					event.initEvent( e, true, true );
					event._args = args;
					ret = bindings[ i ]( event );
				}
			}
		}

		return ret;
	};



	shoestring.fn.trigger = function( evt, args ){
		var evts = evt.split( " " );
		return this.each(function(){
			for( var i = 0, il = evts.length; i < il; i++ ){
				// TODO needs IE8 support
				if( document.createEvent ){
					var event = document.createEvent( "Event" );
					event.initEvent( evts[ i ], true, true );
					event._args = args;
					this.dispatchEvent( event );
				} else if ( document.createEventObject ){
					if( document.documentElement[ evts[ i ] ] === undefined ) {
						document.documentElement[ evts[ i ] ] = {};
					}
					document.documentElement[ evts[ i ] ] = {
						"el" : this,
						_args: args
					};
					document.documentElement[ evts[ i ] ][ evts[ i ] ]++;
				}
			}
		});
	};



	shoestring.fn.unbind = function( evt, callback ){
		var evts = evt.split( " " );
		return this.each(function(){
			for( var i = 0, il = evts.length; i < il; i++ ){
				var bound = this.shoestringData.events[ evt ],
					bindingname = callback.toString();
				if( "removeEventListener" in window ){
					if( callback !== undefined ) {
						this.removeEventListener( evts[ i ], bound[ bindingname ], false );
					} else {
						for ( var ev in bound ) {
							this.removeEventListener( evts[ i ], bound[ ev ], false );
						}
					}
				}
				else if( this.detachEvent ){
					this.detachEvent( "on" + bound[ bindingname ], callback );
				}
			}
		});
	};



	shoestring.each = function( obj, callback, args ){
		var value,
			i = 0,
			length = obj.length,
			isArray = ( typeof obj === "array" );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return shoestring( obj );
	};



	shoestring.merge = function( first, second ){
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return shoestring( first );
	};



})( this );


// jQuery map weee
window.jQuery = shoestring;




/*! Ajax-Include - v0.1.3 - 2014-05-21
* http://filamentgroup.com/lab/ajax_includes_modular_content/
* Copyright (c) 2014 @scottjehl, Filament Group, Inc.; Licensed MIT */

(function( $, win, undefined ){

	var AI = {
		boundAttr: "data-ajax-bound",
		interactionAttr: "data-interaction",
		// request a url and trigger ajaxInclude on elements upon response
		makeReq: function( url, els, isHijax ) {
			$.get( url, function( data, status, xhr ) {
				els.trigger( "ajaxIncludeResponse", [ data, xhr ] );
			});
		},
		plugins: {}
	};

	$.fn.ajaxInclude = function( options ) {
		var urllist = [],
			elQueue = $(),
			o = {
				proxy: null
			};

		// Option extensions
		// String check: deprecated. Formerly, proxy was the single arg.
		if( typeof options === "string" ){
			o.proxy = options;
		}
		else {
			o = $.extend( o, options );
		}

		// if it's a proxy, que the element and its url, if not, request immediately
		function queueOrRequest( el ){
			var url = el.data( "url" );
			if( o.proxy && $.inArray( url, urllist ) === -1 ){
				urllist.push( url );
				elQueue = elQueue.add( el );
			}
			else{
				AI.makeReq( url, el );
			}
		}

		// if there's a url queue
		function runQueue(){
			if( urllist.length ){
				AI.makeReq( o.proxy + urllist.join( "," ), elQueue );
				elQueue = $();
				urllist = [];
			}
		}

		// bind a listener to a currently-inapplicable media query for potential later changes
		function bindForLater( el, media ){
			var mm = win.matchMedia( media );
			function cb(){
				queueOrRequest( el );
				runQueue();
				mm.removeListener( cb );
			}
			if( mm.addListener ){
				mm.addListener( cb );
			}
		}

		// loop through els, bind handlers
		this.not( "[" + AI.boundAttr + "]").not("[" + AI.interactionAttr + "]" ).each(function( k ) {
			var el = $( this ),
				media = el.attr( "data-media" ),
				methods = [ "append", "replace", "before", "after" ],
				method,
				url,
				isHijax = false,
				target = el.attr( "data-target" );

			for( var ml = methods.length, i=0; i < ml; i++ ){
				if( el.is( "[data-" + methods[ i ] + "]" ) ){
					method = methods[ i ];
					url = el.attr( "data-" + method );
				}
			}

			if( !url ) {
				// <a href> or <form action>
				url = el.attr( "href" ) || el.attr( "action" );
				isHijax = true;
			}

			if( method === "replace" ){
				method += "With";
			}

			el.data( "method", method )
				.data( "url", url )
				.data( "target", target )
				.attr( AI.boundAttr, true )
				.each( function() {
					for( var j in AI.plugins ) {
						AI.plugins[ j ].call( this, o );
					}
				})
				.bind( "ajaxIncludeResponse", function( e, data, xhr ){
					var content = data,
						targetEl = target ? $( target ) : el;

					if( o.proxy ){
						var subset = content.match( new RegExp( "<entry url=[\"']?" + el.data( "url" ) + "[\"']?>(?:(?!</entry>)(.|\n))*", "gmi" ) );
						if( subset ){
							content = subset[ 0 ];
						}
					}

					var filteredContent = el.triggerHandler( "ajaxIncludeFilter", [ content ] );

					if( filteredContent ){
						content = filteredContent;
					}

					if( method === 'replaceWith' ) {
						el.trigger( "ajaxInclude", [ content ] );
						targetEl[ el.data( "method" ) ]( content );
					} else {
						targetEl[ el.data( "method" ) ]( content );
						el.trigger( "ajaxInclude", [ content ] );
					}
				});

			// When hijax, ignores matchMedia, proxies/queueing
			if ( isHijax ) {
				AI.makeReq( url, el, true );
			}
			else if ( !media || ( win.matchMedia && win.matchMedia( media ).matches ) ) {
				queueOrRequest( el );
			}
			else if( media && win.matchMedia ){
				bindForLater( el, media );
			}
		});

		// empty the queue for proxied requests
		runQueue();

		// return elems
		return this;
	};

	win.AjaxInclude = AI;
}( jQuery, this ));


// NOTE: the real contents of this file would actually do something useful.
// for demo purposes, it logs a message to the page.
(function( $ ){
	// when dom is ready...
	$(function(){
		$( "<p class='general'>generalenhancements.js was loaded because it is meant for all enhanced browsers.</p>" ).appendTo( "body" );

		// trigger ajaxIncludes
		$( "[data-append],[data-replace],[data-after],[data-before]" ).ajaxInclude( "quickconcat.php?wrap&files=" );
	});
})( jQuery );