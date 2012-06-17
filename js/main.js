var system;
var SIZE = 48;
var MERGIN = 8;

var GameMain = arc.Class.create(arc.Game, {
	initialize: function(params) {
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
		this.map = new Map();
		//this.unit = new Unit();

		//var anim = new arc.anim.Animation(
		//	this.unit,
		//	{x: 100, y: 0, time: 500}
		//);
		//anim.play();
		this.addChild(this.map);
		//this.addChild(this.unit);
		
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
	system = new arc.System(960, 960, 'canvas');
	system.setGameClass(GameMain, {hp:100, mp:100});

	system.addEventListener(arc.Event.PROGRESS, function(e){
	});
	
	system.addEventListener(arc.Event.COMPLETE, function(e){
	});
	
	system.load([
		'img/unit/Unit_mov_1.png',
		'img/unit/Unit_atk_1.png',
		'img/unit/Unit_spc_1.png',
		'img/map/HM_1.png',
	]);
}, false);

var Grid = arc.Class.create({
	_i: 0,
	_j: 0,

	initialize: function(i, j) {
		this._i = i;
		this._j = j;
	},
	set: function(i, j) {
		this._i = i;
		this._j = j;
	},
	get: function() {
		return [this._i, this._j];
	}
});

var Matrix = arc.Class.create({
	_x: 0,
	_y: 0,
	_map: null,
	_name: "Matrix",
	_array: [],

	initialize: function(map, x, y) {
		this._map = map;
		this._x = x;
		this._y = y;
	},
	getMap: function() {
		return this._map;
	},
	getIndex: function(x, y) {
		return y * this._y + x;
	},
	getXY: function(index) {
		var y = parseInt(index / this._y);
		var x = index - y * this._y;
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
		return this._x;
	},
	getY: function() {
		return this._y;
	},
	load: function(matrix) {
		this._array = matrix;
	},
	getNeighbor_4: function(x, y) {
		var arr = [];
		if (isValidGrid(x - 1, y)) {
			arr.push(new Grid(x - 1, y));
		}
		if (isValidGrid(x + 1, y)) {
			arr.push(new Grid(x + 1, y));
		}
		if (isValidGrid(x, y - 1)) {
			arr.push(new Grid(x, y - 1));
		}
		if (isValidGrid(x, y + 1)) {
			arr.push(new Grid(x, y + 1));
		}
		return arr;
	},
	getNeighbor_8: function(x, y) {
		var arr = [];
		if (isValidGrid(x - 1, y -1)) {
			arr.push(new Grid(x - 1, y - 1));
		}
		if (isValidGrid(x + 1, y + 1)) {
			arr.push(new Grid(x + 1, y + 1));
		}
		if (isValidGrid(x - 1, y + 1)) {
			arr.push(new Grid(x - 1, y + 1));
		}
		if (isValidGrid(x + 1, y - 1)) {
			arr.push(new Grid(x + 1, y - 1));
		}
		return arr;
	},
	getAvailGrids: function(x, y, mov) {
		var grid = new Grid(x, y);
		grid.mov = 3;
		grid.stack = [];

		var queue = [];
		queue.push(grid);
		
		var visited = [];
		var movableGrids = [];
		while(queue.length > 0) {
			var t = queue.shift();
			//var tg = new Grid();
			
			// remember where we come from
			//tg.stack = t.stack;
			//tg.stack.push(t);
	
			if (t.mov > 0) {
				// up
				var tg = new Grid(t._i, t._j - 1);
				if (this.isValidGrid(tg) && !visited[tg.j * this.getX() + tg.x]) {
					tg.mov = t.mov - 1;
					visited[tg.j * this.getX() + tg.x] = 1;
					queue.push(tg);
					movableGrids.push(tg);
					tg.stack = t.stack;
					tg.stack.push(t);
					//movableGrids[tg.i][tg.j] = tg;
					// change color of that tile
				}
				// down
				var tg = new Grid(t._i, t._j + 1);
				if (this.isValidGrid(tg) && !visited[tg.j * this.getX() + tg.x]) {
					tg.mov = t.mov - 1;
					visited[tg.j * this.getX() + tg.x] = 1;
					queue.push(tg);
					movableGrids.push(tg);
					tg.stack = t.stack;
					tg.stack.push(t);
					//movableGrids[tg.i][tg.j] = tg;
				}
				// left
				var tg = new Grid(t._i - 1, t._j);
				if (this.isValidGrid(tg) && !visited[tg.j * this.getX() + tg.x]) {
					tg.mov = t.mov - 1;
					visited[tg.j * this.getX() + tg.x] = 1;
					queue.push(tg);
					movableGrids.push(tg);
					tg.stack = t.stack;
					tg.stack.push(t);
					//movableGrids[tg.i][tg.j] = tg;
				}
				// right
				var tg = new Grid(t._i + 1, t._j);
				if (this.isValidGrid(tg) && !visited[tg.j * this.getX() + tg.x]) {
					tg.mov = t.mov - 1;
					visited[tg.j * this.getX() + tg.x] = 1;
					queue.push(tg);
					movableGrids.push(tg);
					tg.stack = t.stack;
					tg.stack.push(t);
					//movableGrids[tg.i][tg.j] = tg;
				}
			}
		}
		return movableGrids;
	},

});

var Map = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Map",
	_stat: 0,
	_scroll: 0,
	_units: [],
	_matrix: null,
	_ct_unit: null,

	initialize: function() {
		// load map
		this._matrix = new Matrix(this, 15, 15);
		
		var _map = new arc.display.Sprite(system.getImage('img/map/HM_1.png'));
		this.addChild(_map);


		// assign units
		var unit = new Unit(this, 9, 9, 0);
		this.addChild(unit);
		this._units.push(unit);
		

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

	_onTouchStart: function(e) {
		this._stat = 1;
		// do nothing
	},
	_onTouchMove: function(e) {
		if (this._stat == 1) {
			// scroll
			this._scroll = 1;
		}
	},
	_onTouchEnd: function(e) {
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

	getUnit: function(i, j) {
		var index = this._matrix.getIndex(i, j);
		return this._unit[index];
	},
	showAvailGrids: function(unit) {
		// get avail grids
		var avail_grids = this._matrix.getAvailGrids(
			parseInt(unit.getX() / SIZE), 
			parseInt(unit.getY() / SIZE),
			unit.getMov()
		);

		// add shader click listener
		// add grid shader 
		this._ct_unit = unit;
	},
});

var Attr = arc.Class.create({
	_name: "Attr",
	initialize: function() {
		console.log("attr initialized");
	},
});

var Unit = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Unit",
	_stat: "normal",
	_direction: "left",
	_map: null,
	_attr: null,

	initialize: function(map, i, j, d) {
		// for future use
		this._attr = new Attr();

		this._map = map
		this._d = d;
		this.setX(i * SIZE);
		this.setY(j * SIZE);
		// laod resoruce according unit type
		this.anim_mov = new arc.display.MovieClip(2, true, true); 

		this._move = [];
		for (var i = 0; i <= 3; ++i) {
			this._move[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_mov_1.png', 
					[48, i * 48, 96, 48]
				), 
				48, 2
			);
		}

		this.anim_mov.addChild(
			this._move[this._d], 
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
	move: function(direction, length) {
		this._removeAllChild();
		this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}});
		
		var cx = this.getX();
		var cy = this.getY();
	
		var tx = cx;
		var ty = cy;

		if (direction == 0) {
			ty += length * SIZE;
		} else if (direction == 1) {
			ty -= length * SIZE;
		} else if (direction == 2) {
			tx -= length * SIZE;
		} else if (direction == 3) {
			tx += length * SIZE;
		}

		var anim = new arc.anim.Animation(
			this.anim_mov,
			//{x: tx - cx, y: ty - cy},
			{x: tx - cx, y: ty - cy, time: 1000}
		);
		
		this.tx = tx;
		this.ty = ty;
		
		anim.play();
		anim.addEventListener(
			arc.Event.COMPLETE, 
			arc.util.bind(this._onMoveComplete, this) 
		);
		this.addChild(this.anim_mov);
	},

	_onMoveComplete: function() {
		this.setX(this.tx);
		this.setY(this.ty);
		this.anim_mov.setX(0);
		this.anim_mov.setY(0);
		console.log(this.tx + " : " + this.ty);
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
		this._d = (this._d + 1) % 4;
		this.move(this._d, 3);
		this._map.showAvailGrids(this);
	},
	getMap: function() {
		return this._map;
	},
	getNeighbor_4: function() {
	},
	getNeighbor_8: function() {
	},
	getMov: function() {
		return 3;
	},
});

