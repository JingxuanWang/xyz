var system;

var GameMain = arc.Class.create(arc.Game, {
	initialize: function(params) {
		console.log("GameMain initialize! " + "params.hp : " + params.hp);
/*
		var target = new arc.display.Sprite(system.getImage('img/unit/Unit_mov_1.png'));
		var anim = new arc.anim.Animation(
			target,
			{x: 0, y: 0, time: 500},
			{x: 100, y: 0, time: 1000}
		);

		//sp.setX(10);
		//sp.setY(10);
		this.addChild(target);

		anim.play();
		this.mc = new arc.display.MovieClip(6, true); 

		var mc1 = new arc.display.SheetMovieClip(
			this._system.getImage('../../output/Unit_mov_1.png', [48, 0, 96, 48]), 
			48, 2
		);
		var mc2 = new arc.display.SheetMovieClip(
			this._system.getImage('../../output/Unit_atk_1.png', [0, 0, 256, 64]), 
			64, 4
		);
		this.mc.addChild(mc1, {
			5 : {x:8, y:8, scaleX: 1, scaleY: 1},
			6 : {x:8, y:8, scaleX: 1, scaleY: 1},
		});
		this.mc.addChild(mc2, {
			1 : {x:0, y:0, scaleX: 1, scaleY: 1},
			2 : {x:0, y:0, scaleX: 1, scaleY: 1},
			3 : {x:0, y:0, scaleX: 1, scaleY: 1},
			4 : {x:0, y:0, scaleX: 1, scaleY: 1},
		});

		this.mc.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClick, this));
*/
		
		this._d = 0;
		this.unit = new Unit();

		//var anim = new arc.anim.Animation(
		//	this.unit,
		//	{x: 100, y: 0, time: 500}
		//);
		//anim.play();
		this.addChild(this.unit);
		
		//this.removeChild(mc);
		//mc.play(true);
		//mc.stop(true);
	},
	_onClick: function() {
	},
	update: function() {
	},
});

window.addEventListener('DOMContentLoaded', function(e){
	system = new arc.System(320, 416, 'canvas');
	system.setGameClass(GameMain, {hp:100, mp:100});

	system.addEventListener(arc.Event.PROGRESS, function(e){
		console.log(e.loaded + ", " + e.total);
	});
	
	system.addEventListener(arc.Event.COMPLETE, function(e){
		console.log('loaded');
	});
	
	system.load([
		'img/unit/Unit_mov_1.png',
		'img/unit/Unit_atk_1.png',
		'img/unit/Unit_spc_1.png',
	]);
}, false);



var Matrix = arc.Class.create({
	_x: 0,
	_y: 0,
	_name: "Matrix",
	_array: [],

	initialize: function(x, y) {
		this._x = x;
		this._y = y;
	},
	getIndex: function(x, y) {
		return y * this._y + x + 1;
	},
	getXY: function(index) {
		var y = parseInt(index / this._y);
		var x = index - y * this._y - 1;
		return [x, y];
	},
	isValidGrid: function(x, y, terrain, unit) {
		if (x < 0 || x > this._x || y < 0 || y > this._y) {
			return false;
		}
		if (terrain) {
			// judge terrain
		}
		if (unit) {
			// judge other unit
		}
		return true;
	},
	setX: function(x) {
		this._x = x;
	},
	setY: function(y) {
		this._y = y;
	},
	getX: function() {
		return x;
	},
	getY: function() {
		return y;
	},
	load: function(matrix) {
		this._array = matrix;
	},
	getNeighbor_4: function(x, y) {
		var arr = [];
		if (isValidGrid(x - 1, y)) {
			arr.push(this.getIndex(x - 1, y));
		}
		if (isValidGrid(x + 1, y)) {
			arr.push(this.getIndex(x + 1, y));
		}
		if (isValidGrid(x, y - 1)) {
			arr.push(this.getIndex(x, y - 1));
		}
		if (isValidGrid(x, y + 1)) {
			arr.push(this.getIndex(x, y + 1));
		}
		return arr;
	},
	getNeighbor_8: function(x, y) {
		var arr = [];
		if (isValidGrid(x - 1, y -1)) {
			arr.push(this.getIndex(x - 1, y - 1));
		}
		if (isValidGrid(x + 1, y + 1)) {
			arr.push(this.getIndex(x + 1, y + 1));
		}
		if (isValidGrid(x - 1, y + 1)) {
			arr.push(this.getIndex(x - 1, y + 1));
		}
		if (isValidGrid(x + 1, y - 1)) {
			arr.push(this.getIndex(x + 1, y - 1));
		}
		return arr;
	},
});

var Map = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Map",
	_stat: 0,
	_scroll: 0,

	initialize: function() {
		// load map

		// regist event listener
		this.addEventListener(
			arc.Event.TOUCH_START, 
			arc.util.bind(this._onTouchStart, this)
		);
		this.addEventListener(
			arc.Event.TOUCH_MOVE, 
			arc.util.bind(this._onTouchMove, this)
		);
		this.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(this._onTouchEnd, this)
		);
	},

	this._onTouchStart(e) {
		this._stat = 1;
		// do nothing
	},
	this._onTouchMove(e) {
		if (this._stat == 1) {
			// scroll
			this._scroll = 1;
		}
	},
	this._onTouchEnd(e) {
		// if is not from TOUCH_MOVE
		if (this._scroll == 1) {
			// scroll end
			this._scroll = 0;
		} else {
			// get target grid info
		}
		
		//
		this._stat = 0;
	},

	scroll: function() {
	},
});


var Unit = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Unit",
	_stat: "normal",
	_direction: "left",
	_map: null,

	initialize: function() {
		// laod resoruce according unit type
		this.anim_mov = new arc.display.MovieClip(10, true, true); 

		this._move = [];
		for (var i = 0; i < 3; ++i) {
			this._move[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_mov_1.png', 
					[48, i * 48, 96, 48]
				), 
				48, 10
			);
		}

		this._d = 0;
		this.anim_mov.addChild(
			this._move[2], 
			{
				1: {}, 
				2: {}, 
			}
		);

		this.addChild(this.anim_mov);
		this.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClick, this));
	},

	// animations with direction
	attack: function(direction) {
	},
	move: function(direction) {
		this._removeAllChild();
		this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}});

		var anim = new arc.anim.Animation(
			this.anim_mov,
			//{x: 0, y: 0},
			{x: 100, y: 0, time: 1000}
		);
		anim.play();

		this.addChild(this.anim_mov);
	},
	stand: function(direction) {
	},

	// animations without direction
	hurt: function() {
	},
	weak: function() {
	},
	power_up: function() {
	},
	
	_onClick: function() {
		this._d = (this._d + 1) % 3;
		this.move(this._d);
	},
});

