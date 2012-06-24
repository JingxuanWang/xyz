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
		//console.log(system.getFps());
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
		'img/pie8.png',
		'img/atk.png',
		'img/mov.png',
	]);
}, false);

var Grid = arc.Class.create(arc.display.DisplayObjectContainer, {
	_i: 0,
	_j: 0,
	_name: "Grid",

	initialize: function(i, j) {
		this._i = i;
		this._j = j;
		this.setX(i * SIZE);
		this.setY(j * SIZE);
		//this.setHeight(SIZE);
		//this.setWidth(SIZE);
	},
	set: function(i, j) {
		this._i = i;
		this._j = j;
	},
	get: function() {
		return [this._i, this._j];
	}
});

// UI
var Button = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Button",
	_map: null,
	initialize: function(x, y, map, sprite) {
		this.setX(x);
		this.setY(y);
		this._map = map;
		this.addChild(sprite);
		this._map.addChild(this);
	},
	_onClick: function() {
		console.log("Button._onClick called");	
	},
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
		grid.mov = mov;
		grid.stack = [];

		var queue = [];
		queue.push(grid);
		
		var visited = [];
		visited[grid._j * this.getX() + grid._i] = 1;
		var movableGrids = [];
		while(queue.length > 0) {
			var t = queue.shift();

			if (t.mov > 0) {
				var gr = [];
				gr[0] = new Grid(t._i, t._j + 1);
				gr[1] = new Grid(t._i, t._j - 1);
				gr[2] = new Grid(t._i - 1, t._j);
				gr[3] = new Grid(t._i + 1, t._j);

				for (var a = 0; a <= 3; ++a) {
					var tg = gr[a];
					if (this.isValidGrid(tg) && !visited[tg._j * this.getX() + tg._i]) {
						tg.mov = t.mov - 1;
						visited[tg._j * this.getX() + tg._i] = 1;
						tg.stack = [];
						//tg.stack.concat(t.stack);
						//tg.stack.push(t.stack.slice(0, t.stack.length));
						for (var b = 0; b < t.stack.length; ++b) {
							var tmp = new Grid(t.stack[b]._i, t.stack[b]._j);
							tmp.d = t.stack[b].d;
							tmp.l = t.stack[b].l;
							tg.stack.push(tmp);
						}
						
						var len = tg.stack.length;
						if (len > 0 && tg.stack[len - 1].d == a) {
							++tg.stack[len - 1].l;
						} else {
							var tmp = new Grid(t._i, t._j);
							tmp.d = a;
							tmp.l = 1;
							tg.stack.push(tmp);
						}
					
						/*
						var tmp = new Grid(t._i, t._j);
						tmp.d = a;
						tmp.l = 1;
						tg.stack.push(tmp);
						*/
						//console.log("Grid: "+tg._i+" : "+tg._j+" : "+t.d+" : "+t.l+" | "+t._i+" : "+t._j);
						//console.log(t.stack);
						//console.log(tg.stack);
						queue.push(tg);
						movableGrids.push(tg);
					}
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
	_buttons: [],
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
		this.avail_grids = [];
		var avail_grids = this._matrix.getAvailGrids(
			parseInt(unit.getX() / SIZE), 
			parseInt(unit.getY() / SIZE),
			unit.getMov()
		);

		// add shader click listener
		for (var i = 0; i < avail_grids.length; ++i) {
			var shader = new arc.display.Sprite(
				system.getImage('img/pie8.png')
			);
			var grid = avail_grids[i];
			//console.log(grid.stack);
			//shader.setX(grid._i * SIZE);
			//shader.setY(grid._j * SIZE);
			grid.addChild(shader);
			grid.addEventListener(
				arc.Event.TOUCH_END, 
				arc.util.bind(unit._onMoveStart, unit)
			);
			this.addChild(grid);
			this.avail_grids.push(grid);
		}

		//console.log(avail_grids);

		// add grid shader 
		this._ct_unit = unit;
	},
	clearAvailGrids: function() {
		for (var i = 0; i < this.avail_grids.length; ++i) {
			this.removeChild(this.avail_grids[i]);
		}
		this.avail_grids = [];
	},
	clearMenu: function() {
		for (var i = 0; i < this._buttons.length; ++i) {
			this.removeChild(this._buttons[i]);
		}
		this._buttons = [];
	},
});

var Attr = arc.Class.create({
	_name: "Attr",
	initialize: function() {
		//console.log("attr initialized");
	},
});

var Unit = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Unit",
	_stat: 0,
	_d: 0,
	_map: null,
	_attr: null,

	initialize: function(map, i, j, d) {
		// for future use
		this._attr = new Attr();
		this._moveStack = [];

		this._map = map
		this._d = d;
		this.setX(i * SIZE);
		this.setY(j * SIZE);
		// laod resoruce according unit type
		this.anim_mov = new arc.display.MovieClip(4, true, true); 
		this.anim_stand = new arc.display.MovieClip(2, true, true); 
		//this.anim_preAttack = new arc.display.MovieClip(2, false, false);
		this.anim_attack = new arc.display.MovieClip(8, false, false);

		this._stand = [];
		this._move = [];
		this._attack = [];
		this._pattack = [];
		for (var i = 0; i <= 3; ++i) {
			this._move[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_mov_1.png', 
					[48, i * 48, 96, 48]
				), 
				48, 4
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._stand[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_mov_1.png', 
					[48, i * 48, 96, 48]
				), 
				48, 2
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._attack[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_atk_1.png', 
					[0, i * 64, 256, 64]
				), 
				64, 8
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._pattack[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_atk_1.png', 
					[0, i * 64, 64, 64]
				), 
				64, 8, false, true
			);
		}


		this.anim_stand.addChild(
			this._stand[this._d], 
			{
				1: {}, 
				2: {},
			}
		);

		this.addChild(this.anim_stand);
		this.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClick, this));
	},

	// animations with direction
	attack: function() {
		this.anim_attack._removeAllChild();
		this._removeAllChild();
		this._attack[this._d].gotoAndStop(1);
		this._pattack[this._d].gotoAndStop(1);
		this.anim_attack.addChild(
			this._pattack[this._d],
			{
				1: {visible: true},
				5: {visible: false},
			}
		);
		this.anim_attack.addChild(
			this._attack[this._d],
			{
				5: {},
				6: {},
				7: {},
				8: {},
			}
		);
		this.addChild(this.anim_attack);
		this._attack[this._d].addEventListener(
			arc.Event.COMPLETE,
			arc.util.bind(this.stand, this)
		);
		this.anim_attack.gotoAndPlay(1);
	},
	stand: function() {
		this._removeAllChild();
		this.anim_stand.addChild(this._stand[this._d], {1:{}, 2:{}});
		this.addChild(this.anim_stand);
	},
	move: function(direction, length) {
		console.log("move ("+direction+","+length+")");
		this._removeAllChild();
		//this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}, 3:{}, 4:{}});
		this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}});
		this._d = direction;

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
			{x: tx - cx, y: ty - cy, time: 500 * length}
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

	_onMoveStart: function(e) {
		if (this._stat > 200) {
			return;
		}
		this._stat = 201;
		var stack = e.target.stack;
		//console.log(stack);
		this._moveStack = stack;
		this.nextMove();
	},
	_onMoveComplete: function() {
		this.setX(this.tx);
		this.setY(this.ty);
		this.anim_mov.setX(0);
		this.anim_mov.setY(0);
		//console.log(this.tx + " : " + this.ty);
		this.nextMove();	
	},

	nextMove: function() {
		//console.log("nextMove called");
		if (this._moveStack.length > 0) {
			var next_move = this._moveStack.shift();
			//console.log(next_move);
			this.move(next_move.d, next_move.l);
		} else {
			this.stand();
			this._map.clearAvailGrids();
			this._stat = 0;
			//this.showMenu();
		}
	},

	prepareMove: function() {
		if (this._stat != 100) {
			return;
		}
		this._map.clearMenu();
		this._map.showAvailGrids(this);
		this._stat = 200;
	},
	prepareAttack: function() {
		this._map.clearMenu();
		this.attack();
		this._stat = 0;
	},

	// animations without direction
	hurt: function() {
	},
	weak: function() {
	},
	power_up: function() {
	},
	
	_onClick: function() {
		if (this._stat > 0) {
			return;
		}
		
		//this._d = (this._d + 1) % 4;
		//this.move(this._d, 3);
		var button_atk = new Button(
			this.getX() - 30, this.getY(),
			this._map,
			new arc.display.Sprite(system.getImage('img/atk.png'))
		);
		var button_mov = new Button(
			this.getX() + 50, this.getY(),
			this._map,
			new arc.display.Sprite(system.getImage('img/mov.png'))
		);
		button_mov.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(this.prepareMove, this)
		);
		button_atk.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(this.prepareAttack, this)
		);
		this._map._buttons.push(button_mov);
		this._map._buttons.push(button_atk);
		
		// be selected
		this._stat = 100;
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

