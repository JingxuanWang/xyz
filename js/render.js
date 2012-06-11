var gridSize = 40;
var speed = 1;

var initial_point = new Point(200, 200);
var grid_size = new Size(40, 40);
var grid_image = new Image();
var mouse_image = new Image();
var hero_image = new Image();


// Basic Game Object in Game Play
var GameObject = Rect.subclass({
	classname: 'GameObject',
	initialize: function($super, origin, size, image) {
		$super(origin, size);
		this.image = image;
		this.padding = 2;
	},
	isContain: function(p) {
		if (p.getX() <= this.getMaxX() && p.getX() >= this.getMinX()
		&&  p.getY() <= this.getMaxY() && p.getY() >= this.getMinY()) {
			return true;	
		}
		return false;
	},
	setImage: function(img) {
		this.image = img;
	},
	getImage: function() {
		return this.image;
	},
	getImgOrigX: function() {
		return this.getMinX() + this.padding;	 
	},
	getImgOrigY: function() {
		return this.getMinY() + this.padding;	 
	},
});

// Unit: Movable Objects 
var Unit = GameObject.subclass({
	classname: 'Unit',
	initialize: function($super, origin, size, image) {
		$super(origin, size, image);
		this.tgtPoint = new Point(origin);
		this.speed = 0.5;
		this.isMoving = false;
	},
	setTarget: function(p) {
		this.tgtPoint = p;
	},
	getTarget: function(p) {
		return this.tgtPoint;
	},
	setSpeed: function(spd) {
		this.speed = spd;
	},
	getSpeed: function() {
		return this.speed;
	},
	move: function() {
		// move torward target point
		var dx = 0;
		var dy = 0;
		
		if (this.tgtPoint.getY() > this.getMinY()) {
			dy = 1;
		} else if (this.tgtPoint.getY() < this.getMinY()) {
			dy = -1;
		} else {
			dy = 0;
		}
		
		if (this.tgtPoint.getX() > this.getMinX()) {
			dx = 1;
		} else if (this.tgtPoint.getX() < this.getMinX()) {
			dx = -1;
		} else {
			dx = 0;
		}
	
		if (dx != 0 || dy != 0) {
			this._origin.setX(this.getMinX() + dx * speed);
			this._origin.setY(this.getMinY() + dy * speed);
			this.isMoving = true;
		} else {
			this.isMoving = false;
		}
	},
});

// Grid: Stable Objects 
var Grid = GameObject.subclass({
	classname: 'Grid',
	initialize: function($super, origin, size, image) {
		$super(origin, size, image);
		this._passable = true;
	},
	getPassable: function() {
		return this._passable;
	},
	setPassable: function(pas) {
		this._passable = pas;
	},
	getIndexX: function() {
		return this.getMinX() / gridSize;
	},
	getIndexY: function() {
		return this.getMinY() / gridSize;
	},
});

