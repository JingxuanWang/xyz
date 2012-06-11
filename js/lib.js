/**
 * The default constructor.
 * @constructor 
 * @class The <code>Class</code> object provides an environment for Object Oriented Programming (OOP) development in Javascript, such as Java or C++.
 * @name Core.Class
 */
var Class = function() {}

/**
 * Create a new class by extending another class.
 * @example
 * var MyClass = Class.subclass(
 * {
 *    initialize: function()
 *    {
 *        console.log('constructor');
 *    },
 *    foo: function(v)
 *    {
 *        console.log('MyClass.foo(' + v + ')');
 *    },
 * });
 * var myClass = new MyClass();
 * myClass.foo('param');
 * @param {Object} extensions Object literal containing new functions for the derived class.
 * @function
 * @name Core.Class.subclass
 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
 */
Class.subclass = (function()
{
/**#@+ @ignore */
	// Parse a function body and extract the parameter names.
	function argumentNames(body)
	{
		var names = body.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
			.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
			.replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}
	
	// Create a function that calls overrideBody with a closure to ancestorBody.
	function overrideMethod(overrideBody, ancestorBody)
	{
		if(ancestorBody !== undefined)
		{
			// Create a function that calls overrideBody with a closure to ancestorBody as the first param.
			var override = function()
			{
				var localThis = this;
				var $super = function() { return ancestorBody.apply(localThis, arguments) };
				Array.prototype.unshift.call(arguments, $super);
				return overrideBody.apply(this, arguments);
			}
		}
		else
		{
			// Create a function that calls overrideBody with undefined as the first param, because ancestorBody is undefined.
			var override = function()
			{
				Array.prototype.unshift.call(arguments, undefined);
				return overrideBody.apply(this, arguments);
			}
		}

		// Hide our dirty tricks from the rest of the world.
		override.valueOf = function() { return overrideBody.valueOf() };
		override.toString = function() { return overrideBody.toString() };
		return override;
	}
	
	// Define some empty functions used later. This is a speed optimization.
	function TempClass() {}
	function emptyFunction() {}
	
	return function()
	{
		// Constructor for new class to be created.
		var properties = arguments[0];
		var classname = properties.classname || "AnonymousClass";
		var NewClass = eval('(function ' + classname + '(){this.initialize.apply(this, arguments)})');
		
		// Copy statics from this.
		for(var property in this)
		{
			if(!this.hasOwnProperty(property)) continue;
			NewClass[property] = this[property];
		}
		
		// Copy prototype from this.
		var ancestorPrototype = this.prototype;
		TempClass.prototype = ancestorPrototype;
		NewClass.prototype = new TempClass();
		NewClass.prototype.superclass = ancestorPrototype;
		NewClass.prototype.constructor = NewClass;
		
		// Copy properties into NewClass prototype.
		for(var property in properties)
		{
			if(!properties.hasOwnProperty(property)) continue;

			// getters / setters behave differently than normal properties.
			var getter = properties.__lookupGetter__(property)
			var setter = properties.__lookupSetter__(property)
			if(getter || setter)
			{
				if(getter)
				{
					// Copy getter into klass.
					var value = getter;
					if(argumentNames(value)[0] == "$super")
						value = overrideMethod(value, ancestorPrototype.__lookupGetter__(property));
					NewClass.prototype.__defineGetter__(property, value);
				}

				if(setter)
				{
					// Copy setter into klass.
					var value = setter;
					if(argumentNames(value)[0] == "$super")
						value = overrideMethod(value, ancestorPrototype.__lookupSetter__(property));
					NewClass.prototype.__defineSetter__(property, value);
				}
			}
			else
			{
				var value = properties[property];
				if(typeof value === "function" && property[0] != '$')
				{
					if(argumentNames(value)[0] == "$super")
					{
						// Create override method if first param is $super.
						value = overrideMethod(value, ancestorPrototype[property]);
					}
					else if(property == 'initialize')
					{
						var ancestorInitialize = ancestorPrototype.initialize
						if(ancestorInitialize)
						{
							// Automatically call inherited constructor.
							var derivedInitialize = value;
							value = function()
							{
								ancestorInitialize.apply(this, arguments);
								derivedInitialize.apply(this, arguments);
							};
						}
					}
					else if(property == 'destroy')
					{
						var ancestorDestroy = ancestorPrototype.destroy
						if(ancestorDestroy)
						{
							// Automatically call inherited destructor.
							var derivedDestroy = value;
							value = function()
							{
								derivedDestroy.apply(this, arguments);
								ancestorDestroy.apply(this, arguments);
							};
						}
					}

					// Copy function into new class prototype.
					NewClass.prototype[property] = value;
				}
				else
				{
					if(property[0] == '$')
						property = property.slice(1);

					// Copy enum into new class and the prototype.
					NewClass[property] = value;
					NewClass.prototype[property] = value;
				}
			}
		}
		
		// Make sure the is an initialize function.
		if(!NewClass.prototype.initialize)
			NewClass.prototype.initialize = emptyFunction;

		return NewClass;
	}
/**#@-*/
})();

/**
 * Create a singleton by extending a class.
 * @example
 * var MySingleton = Class.singleton(
 * {
 *    initialize: function()
 *    {
 *        console.log('constructor');
 *    },
 *    foo: function(v)
 *    {
 *        console.log('MyClass.foo(' + v + ')');
 *    },
 * });
 * MySingleton.foo('param');
 * @param {Object} extensions Object literal containing new functions for the singleton.
 * @function
 * @name Core.Class.singleton
 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
 */
Class.singleton = function()
{
	// Create sublcass as normal.
	var tempClass = this.subclass.apply(this, arguments);
	
	// Hide the initialize.
	var initialize = tempClass.prototype.initialize;
	tempClass.prototype.initialize = function() {};
	
	// Now instantiate.
	var instance = new tempClass();
	
	// Hide every prototype function with an instance function that calls initialize.
	var functions = [];
	/** 
	 * Ensure that the singleton has been created and fully initialized.
	 * @status iOS, Android, Flash
	*/
	var instantiate = function(real)
	{
		// Delete all of the instance functions we added.
		for(var i in functions)
		{
			var func = functions[i];
			delete instance[func];
		}
		
		// Restore the initialize function and call it.
		instance.initialize = initialize;
		instance.initialize();
		
		// Replace instantiate method with an empty function.
		instance.instantiate = function() {};
		
		// Call the function that caused this instantiation.
		var args = Array.prototype.slice.call(arguments, 1);
		return real.apply(instance, args);
	}
	
	// Iterate over all prototype functions.
	for(var i in instance)
	{
		// Don't do anything for setters or getters.
		if(instance.__lookupGetter__(i)
			|| instance.__lookupSetter__(i))
		{
			//TODO Should put proxies here too.
			continue;
		}
			
		var value = instance[i];
		if(typeof(value) == 'function')
		{
			// Remember the function names that we added so that instantiate() can remove them.
			functions.push(i);
			
			// Add an instance function to hide the prototype function, which will call instantiate.
			instance[i] = instantiate.bind(this, value);
		}
	}
	
	// Add instantiate method.
	instance.instantiate = instantiate.bind(this, function() {});
	
	// Return the isntance.
	return instance;
}

/**
 * @ignore
 */
Class.prototype.bind = function(func)
{
	var context = this;
	if(arguments.length < 2)
	{
		// Fast path if only the 'this' pointer is being bound.
		return function()
		{
			return func.apply(context, arguments);
		}
	}
	else
	{
		// Slower path if additional parameters are being bound.
		var args = Array.prototype.slice.call(arguments, 1);
		return function()
		{
			var finalArgs = args.concat(Array.prototype.slice.call(arguments, 0));
			return func.apply(context, finalArgs);
		}
	}
}

/**
 * @ignore
 */
Class.prototype.toString = function()
{
	return this.constructor.name;
}

// Debug implementation that will replace every method in destroyed objects with a grenade.
/*Class.prototype.destroy = function()
{
	function suicide()
	{
		throw new Error('Function called on destroyed object');
	}
	
	for(var i in this)
	{
		var value = this[i];
		if(typeof(value) == 'function')
		{
			this[i] = suicide;
		}
	}
}*/

var Point = Class.subclass(
/** @lends Core.Point.prototype */
{
	classname: 'Point',
	
	/**
	 * @class The <code>Point</code> class defines a 2D point coordinate (<i>x</i> and <i>y</i>). 
	 * @status iOS, Android, Flash, Test
	 * @constructs The default constructor. <br><br>
	 * <b>Example:</b>The following code examples illustrate a variety of different calling styles for <code>Point</code> objects.<br><br>
	 * All components are set to zero.
	 * <pre class="code">var style1 = new Core.Point();</pre>
	 *
	 * Copy an existing point.
	 * <pre class="code">var style2 = new Core.Point(style1);</pre>
	 *
	 * Specify a value for both components.
	 * <pre class="code">var style3 = new Core.Point(1.0, 1.0);</pre>
	 *
	 * Specify a value for both components.
	 * <pre class="code">var style4 = new Core.Point([1.0, 1.0]);</pre>
	 * @augments Core.Class
	 * @param {Number} [x=0] The <i>x</i> coordinate.
	 * @param {Number} [y=0] The <i>y</i> coordinate.
	 * @throws {Wrong number of arguments for a Point} Number of parameters passed by this call is invalid.
	 */
	initialize: function(x, y)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._x = 0;
				this._y = 0;
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._x = 0;
					this._y = 0;
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (point)
					this._x = rhs.getX();
					this._y = rhs.getY();
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._x = 0;
							this._y = 0;
							break;
						case 1:
							// ([point])
							rhs = rhs[0];
							this._x = rhs.getX();
							this._y = rhs.getY();
							break;
						case 2:
							// ([x, y])
							this._x = rhs[0];
							this._y = rhs[1];
							break;
						default:
							throw new Error('Wrong number of arguments for a Point');
					}
				}
				break;
			case 2:
				// (x, y)
				this._x = arguments[0];
				this._y = arguments[1];
				break;
			default:
				throw new Error('Wrong number of arguments for a Point');
		}
	},
	
	/**
	 * Set the value of both the <i>x</i> and <i>y</i> components. 
	 * @param {Number} [<i>x</i>=0] The new <i>x</i> coordinate.
	 * @param {Number} [<i>y</i>=0] The new <i>y</i> coordinate.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Point for examples of supported calling styles.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setAll: function(x, y)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate this <code>Point</code>.
	 * @returns {Core.Point} A new point with identical <i>x</i> and <i>y</i> coordinates to the cloned point.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the value of the <i>x</i> component of this <code>Point</code>.
	 * @returns {Number} The current <i>x</i> coordinate.
	 * @see Core.Point#setX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getX: function()
	{
		return this._x;
	},
	
	/**
	 * Set the value of the <i>x</i> component for this <code>Point</code>.
	 * @param {Number} <i>x</i> The new <i>x</i> coordinate.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Point#getX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setX: function(x)
	{
		this._x = x;
		return this;
	},
	
	/**
	 * Retrieve the value of the <i>y</i> component of this <code>Point</code>.
	 * @returns {Number} The current <i>y</i> coordinate.
	 * @see Core.Point#setY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getY: function()
	{
		return this._y;
	},
	
	/**
	 * Set the value of the <i>y</i> component for this <code>Point</code>.
	 * @param {Number} <i>y</i> The new <i>y</i> coordinate.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Point#getY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setY: function(y)
	{
		this._y = y;
		return this;
	},
});

var Size = Class.subclass(
/** @lends Core.Size.prototype */
{
	classname: 'Size',
	
	/**
	 * @class The <code>Size</code> class constructs objects that define size values for the <i>height</i> and <i>width</i> components. 
	 * @status iOS, Android, Flash
	 * Supported values range between <code>(0-1)</code>.
	 * @constructs The default constructor. <br><br>
	 * The following code examples illustrate a variety of different calling styles for <code>Size</code> objects.<br><br>
	 * Set both component values to 0.
	 * <pre class="code">var style1 = new Core.Size();</pre>
	 *
	 * Copy an existing size.
	 * <pre class="code">var style2 = new Core.Size(style1);</pre>
	 *
	 * Specify a value for both components.
	 * <pre class="code">var style3 = new Core.Size(1.0, 1.0);</pre>
	 *
	 * Specify a value for both components.
	 * <pre class="code">var style4 = new Core.Size([1.0, 1.0]);</pre>
	 * @augments Core.Class
	 * @param {Number} [width=0] The <i>width</i> component.
	 * @param {Number} [height=0] The <i>height</i> component.
	 */
	initialize: function(width, height)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._width = 0;
				this._height = 0;
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._width = 0;
					this._height = 0;
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (size)
					this._width = rhs.getWidth();
					this._height = rhs.getHeight();
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._width = 0;
							this._height = 0;
							break;
						case 1:
							// ([size])
							rhs = rhs[0];
							this._width = rhs.getWidth();
							this._height = rhs.getHeight();
							break;
						case 2:
							// ([x, y])
							this._width = rhs[0];
							this._height = rhs[1];
							break;
						default:
							throw new Error('Wrong number of arguments for a Size');
					}
				}
				break;
			case 2:
				// (x, y)
				this._width = arguments[0];
				this._height = arguments[1];
				break;
			default:
				throw new Error('Wrong number of arguments for a Size');
		}
	},
	
	/**
	 * Set the value of all components for this <code>Size</code>. 
	 * @param {Number} [width=0] The new <i>width</i>.
	 * @param {Number} [height=0] The new <i>height</i>.
	 * @throws {Wrong number of arguments for a Size} Number of parameters passed by this call is invalid.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Size for examples of supported calling styles.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setAll: function(width, height)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate this <code>Size</code>.
	 * @returns {Core.Size} A new size with identical <i>height</i> and <i>width</i> components.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the value of the <i>width</i> component for this <code>Size</code>.
	 * @returns {Number} The current <i>width</i>.
	 * @see Core.Size#setWidth
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getWidth: function()
	{
		return this._width;
	},
	
	/**
	 * Set the value of the <i>width</i> component for this <code>Size</code>.
	 * @param {Number} width The new <i>width</i>.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Size#getWidth
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setWidth: function(width)
	{
		this._width = width;
		return this;
	},
	
	/**
	 * Retrieve the value of the <i>height</i> component for this <code>Size</code>.
	 * @returns {Number} The current <i>height</i>.
	 * @see Core.Size#setHeight
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getHeight: function()
	{
		return this._height;
	},
	
	/**
	 * Set the value of the <i>height</i> component for this <code>Size</code>.
	 * @param {Number} height The new <i>height</i>.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Size#getHeight
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setHeight: function(height)
	{
		this._height = height;
		return this;
	},
});

var Rect = Class.subclass(
/** @lends Core.Rect.prototype */
{
	classname: 'Rect',
	
	/**
	 * @class The <code>Rect</code> class constructs a rectangle object that is derived from two values: a point of origin  
	 * and a size.	 
	 * @status iOS, Android, Flash
	 * @constructs The default constructor. <br><br>
	 * The following code examples illustrate a variety of different calling styles for <code>Rect</code> objects.<br><br>
	 * All components set to zero.
	 * <pre class="code">var style1 = new Core.Rect();</pre>
	 *
	 * Copy an existing <code>rect</code>.
	 * <pre class="code">var style2 = new Core.Rect(style1);</pre>
	 *
	 * Specify a point and size.
	 * <pre class="code">var style3 = new Core.Rect(new Core.Point(), new Core.Size());</pre>
	 *
	 * Specify four components.
	 * <pre class="code">var style4 = new Core.Rect(0, 0, 100, 100);</pre>
	 * @augments Core.Class
	 * @param {Core.Point} [origin=0] The rectangle point of origin.
	 * @param {Core.Size} [size=0] The rectangle size.
	 * @throws {Wrong number of arguments for a Rect} Number of parameters passed by this call is invalid.
	 */
	initialize: function(origin, size)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._origin = new Point();
				this._size = new Size();
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._origin = new Point();
					this._size = new Size();
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (rect)
					this._origin = new Point(rhs.getOrigin());
					this._size = new Size(rhs.getSize());
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._origin = new Point();
							this._size = new Size();
							break;
						case 1:
							// ([rect])
							rhs = rhs[0];
							this._origin = new Point(rhs.getOrigin());
							this._size = new Size(rhs.getSize());
							break;
						case 2:
							// ([point, size])
							// ([[x, y], [width, height]])
							this._origin = new Point(rhs[0]);
							this._size = new Size(rhs[1]);
							break;
						case 4:
							// ([x, y, width, height])
							this._origin = new Point(rhs[0], rhs[1]);
							this._size = new Size(rhs[2], rhs[3]);
							break;
						default:
							throw new Error('Wrong number of arguments for a Rect');
					}
				}
				break;
			case 2:
				// (point, size)
				this._origin = new Point(arguments[0]);
				this._size = new Size(arguments[1]);
				break;
			case 4:
				// (x, y, width, height)
				this._origin = new Point(arguments[0], arguments[1]);
				this._size = new Size(arguments[2], arguments[3]);
				break;
			default:
				throw new Error('Wrong number of arguments for a Rect');
		}
	},
	
	/**
	 * Set the value of all components for this <code>rect</code>. 
	 * @param {Core.Point} [origin=0] The new point of origin.
	 * @param {Core.Size} [size=0] The new rectangle size.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Rect for examples of supported calling styles.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setAll: function(origin, size)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate the point of origin of this <code>rect</code>.
	 * @returns {Core.Point} A new rectangle with an identical origin and size.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the point of origin for this <code>rect</code>.
	 * @returns {Core.Point} The current point of origin.
	 * @see Core.Rect#setOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getOrigin: function()
	{
		return this._origin;
	},
	
	/**
	 * Set the point of origin for this <code>rect</code>.
	 * @param {Core.Point} origin The new point of origin.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Rect#getOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setOrigin: function(origin)
	{
		this._origin.setAll(origin);
		return this;
	},
	
	/**
	 * Change the point of origin so that the center of this <code>rect</code> is at the specified location.
	 * @param {Core.Point} origin The new point of origin that results in a rectangle with a center position at the specified location.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Rect#setSizeCentered,
	 * @see Core.Rect#setOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setOriginCentered: function(origin)
	{
		origin = new Core.Point(origin);
		this._origin.setX(origin.getX() - this._size.getWidth()/2);
		this._origin.setY(origin.getY() - this._size.getHeight()/2);
		return this;
	},
	
	/**
	 * Retrieve the size of this <code>rect</code>.
	 * @returns {Core.Size} The current rectangle size.
	 * @see Core.Rect#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getSize: function()
	{
		return this._size;
	},
	
	/**
	 * Set the size of this <code>rect</code>.
	 * @param {Core.Size} size The new rectangle size.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Rect#getSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setSize: function(size)
	{
		this._size.setAll(size);
		return this;
	},
	
	/**
	 * Set the size of this <code>rect</code> and preserve the current center position.
	 * @param {Core.Size} size The new rectangle size that retains the current center position.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Core.Rect#setOriginCentered,
	 * @see Core.Rect#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	setSizeCentered: function(size)
	{
		var oldWidth = this._size.getWidth();
		var oldHeight = this._size.getHeight();
		
		this._size.setAll(size);

		this._origin.setX(this._origin.getX() + oldWidth/2 - this._size.getWidth()/2);
		this._origin.setY(this._origin.getY() + oldHeight/2 - this._size.getHeight()/2);
		return this;
	},
	
	/**
	 * Retrieve the minimum value for <i>x</i>. This is represented by the left coordinate.
	 * @returns {Number} The current minimum value of  the <i>x</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMinX: function()
	{
		return this._origin.getX();
	},
	
	/**
	 * Retrieve the average of the minimum and maximum <i>x</i> values. This is the middle coordinate.
	 * @returns {Number} The current average of the minimum and maximum <i>x</i> coordinate values. 
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMidX: function()
	{
		return this._origin.getX() +  this._size.getWidth()/2;
	},
	
	/**
	 * Retrieve the maximum value for <i>x</i>. This is the right coordinate.
	 * @returns {Number} The current maximum value of the <i>x</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMaxX: function()
	{
		return this._origin.getX() + this._size.getWidth();
	},
	
	/**
	 * Retrieve the minimum value for <i>y</i>. This is the top coordinate.
	 * @returns {Number} The current minimum value of the <i>y</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMinY: function()
	{
		return this._origin.getY();
	},
	
	/**
	 * Retrieve the average of the minimum and maximum <i>y</i> values. This is the middle coordinate.
	 * @returns {Number} The current average of the minimum and maximum <i>y</i> coordinate values.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMidY: function()
	{
		return this._origin.getY() + this._size.getHeight()/2;
	},
	
	/**
	 * Retrieve the maximum value for <i>y</i>. This is the bottom coordinate.
	 * @returns {Number} The current maximum value of the <i>y</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
	getMaxY: function()
	{
		return this._origin.getY() + this._size.getHeight();
	},
});

