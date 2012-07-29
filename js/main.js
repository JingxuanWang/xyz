// system that manipulate canvas
var system;

// configuration
var CONFIG;

// game status
// avoid unit action at the same time
var STAT = 0;

var INFOBOX = null;

// 100 _onClick get through
// 200 show available grids for move
// 201 onMoveStart: is moving
// 300 show available grids for attack
// 301 onAttackStart: is attacking

var GameMain = arc.Class.create(arc.Game, {
	initialize: function(params) {

		this.map = new Map();
		this.addChild(this.map);
	},

	update: function() {
		//console.log(system.getFps());
		if ((STAT == 400 || STAT == 500) && INFOBOX != null) {
			INFOBOX.update();
		}
		//if (this.map != null && this.map._units[0] != null) {
			//console.log(this.map._units[0].getWidth());
		//}
	},
});

window.addEventListener('DOMContentLoaded', function(e){
	var ajax = new arc.Ajax();
	ajax.addEventListener(arc.Event.COMPLETE, function() {
		CONFIG = ajax.getResponseJSON();
		system = new arc.System(
			CONFIG.const.system.width, 
			CONFIG.const.system.height, 
			'canvas'
		);
		system.setGameClass(GameMain);
		system.addEventListener(arc.Event.PROGRESS, function(e){});
		system.addEventListener(arc.Event.COMPLETE, function(e){});
		system.load(CONFIG.image);
	});
	ajax.load('js/data.json');
}, false);

var Grid = arc.Class.create(arc.display.DisplayObjectContainer, {
	_i: 0,
	_j: 0,
	_name: "Grid",

	initialize: function(i, j) {
		this._i = i;
		this._j = j;
		this.setX(i * CONFIG.const.SIZE);
		this.setY(j * CONFIG.const.SIZE);
		//this.setHeight(CONFIG.const.SIZE);
		//this.setWidth(CONFIG.const.SIZE);
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
		movableGrids.push(grid);

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
	getAtkRngGrids: function(x, y, type) {
		var gr = [];
		var ar = [];
		if (type == 1) {
			gr[0] = new Grid(x, y + 1);
			gr[1] = new Grid(x, y - 1);
			gr[2] = new Grid(x - 1, y);
			gr[3] = new Grid(x + 1, y);
		} else if (type == 2){
			gr[0] = new Grid(x, y + 1);
			gr[1] = new Grid(x, y - 1);
			gr[2] = new Grid(x - 1, y);
			gr[3] = new Grid(x + 1, y);
			gr[4] = new Grid(x + 1, y + 1);
			gr[5] = new Grid(x - 1, y - 1);
			gr[6] = new Grid(x - 1, y + 1);
			gr[7] = new Grid(x + 1, y - 1);
		} else if (type == 3) {
			gr[0] = new Grid(x, y + 1);
			gr[1] = new Grid(x, y - 1);
			gr[2] = new Grid(x - 1, y);
			gr[3] = new Grid(x + 1, y);
			gr[4] = new Grid(x + 1, y + 1);
			gr[5] = new Grid(x - 1, y - 1);
			gr[6] = new Grid(x - 1, y + 1);
			gr[7] = new Grid(x + 1, y - 1);
			gr[8] = new Grid(x, y + 2);
			gr[9] = new Grid(x + 2, y);
			gr[10] = new Grid(x, y - 2);
			gr[11] = new Grid(x - 2, y);
		}
		while(gr.length > 0) {
			var tmp = gr.shift();
			if (this.isValidGrid(tmp)) {
				ar.push(tmp);
			}
		}
		return ar;
	}
});

var Map = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Map",
	_stat: 0,
	_scroll: 0,
	_units: [],
	_buttons: [],
	_matrix: null,
	_ct_unit: null,
	avail_grids: [],

	initialize: function() {
		// load map
		this._matrix = new Matrix(this, CONFIG.map.width, CONFIG.map.height);

		//var _map = new arc.display.Sprite(system.getImage(CONFIG.map.image));
		//this.addChild(_map);
		var ctx = document.getElementById("map").getContext('2d');
		var _map = new Image();
		_map.src = CONFIG.map.image;
		ctx.drawImage(_map, 0, 0);
		

		this._unit_layer = new arc.display.DisplayObjectContainer();
		this._ui_layer = new arc.display.DisplayObjectContainer();
		this._effect_layer = new arc.display.DisplayObjectContainer();
		this.addChild(this._effect_layer);
		this.addChild(this._unit_layer);
		this.addChild(this._ui_layer);

		for (var i = 0; i < CONFIG.map.unit.length; ++i) {
			var unit_conf = CONFIG.map.unit[i];
			// assign units
			var unit = new Unit(this, unit_conf);
			//this.addChild(unit);
			this._unit_layer.addChild(unit);
			this._units.push(unit);
		}

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
	},
	_onTouchMove: function(e) {
	},
	_onTouchEnd: function(e) {
		if (this._ct_unit == null) {
			return;
		}
		if (STAT == 200) {
			var t = e.target;
			// find touch target is movable
			for (var i = 0; i < this.avail_grids.length; ++i) {
				var g = this.avail_grids[i];
				if (
					t.getX() < g.getX() + CONFIG.const.SIZE
				&&  t.getX() >= g.getX()
				&&	t.getY() < g.getY() + CONFIG.const.SIZE
				&&  t.getY() >= g.getY()
				) {
					var unit = this._ct_unit;
					unit._onMoveStart(g);
				}
			}
		};	
	},

	restore: function() {
		this._ct_unit = null;
	},

	scroll: function() {
	},

	getUnit: function(x, y) {
		for (var i = 0; i < this._units.length; ++i) {
			if (this._units[i].getX() == x 
			&&  this._units[i].getY() == y) {
				return this._units[i];
			}
		}
		return null;
	},
	showAvailGrids: function(unit) {
		// get avail grids
		this.avail_grids = [];
		this.attack_range = [];
		var avail_grids = this._matrix.getAvailGrids(
			parseInt(unit.getX() / CONFIG.const.SIZE), 
			parseInt(unit.getY() / CONFIG.const.SIZE),
			unit.get("mov")
		);
		var attack_range = this._matrix.getAtkRngGrids(
			parseInt(unit.getX() / CONFIG.const.SIZE), 
			parseInt(unit.getY() / CONFIG.const.SIZE),
			unit.get("rng")
		);

		// add shader click listener
		for (var i = 0; i < avail_grids.length; ++i) {
			var shader = new arc.display.Sprite(
				system.getImage(CONFIG.UI.mov_base)
			);
			var grid = avail_grids[i];
			grid.addChild(shader);
			grid.addEventListener(
				arc.Event.TOUCH_END, 
				arc.util.bind(unit._onMoveStart, unit)
			);
			this._effect_layer.addChild(grid);
			this.avail_grids.push(grid);
		}

		for (var i = 0; i < attack_range.length; ++i) {
			var mark = new arc.display.Sprite(
				system.getImage(CONFIG.UI.ar)
			);
			var grid = attack_range[i];
			for (var j = 0; j < avail_grids.length; ++j) {
				var g = avail_grids[j];
				if (g.getX() == grid.getX() && g.getY() == grid.getY()) {
					grid.stack = g.stack; 
					break;
				}
			}

			grid.addEventListener(
				arc.Event.TOUCH_END, 
				arc.util.bind(unit._onMoveStart, unit)
			);

			grid.addChild(mark);
			this._effect_layer.addChild(grid);
			this.attack_range.push(grid);
		}
		//console.log(avail_grids);

		// add grid shader 
		this._ct_unit = unit;
	},
	showAttackRange: function(unit) {
		// get avail grids
		this.avail_grids = [];

		// TODO: this will be changed
		var avail_grids = this._matrix.getAtkRngGrids(
			parseInt(unit.getX() / CONFIG.const.SIZE), 
			parseInt(unit.getY() / CONFIG.const.SIZE),
			unit.get("rng")
		);

		// add shader click listener
		for (var i = 0; i < avail_grids.length; ++i) {
			var shader = new arc.display.Sprite(
				system.getImage(CONFIG.UI.mov_base)
			);
			var grid = avail_grids[i];
			grid.addChild(shader);
			
			var enemy = this.getUnit(grid.getX(), grid.getY());
			if (enemy == null) {
				grid.addEventListener(
					arc.Event.TOUCH_END, 
					arc.util.bind(unit._onAttackStart, unit)
				);
			} else {
				enemy.addEventListener(
					arc.Event.TOUCH_END, 
					arc.util.bind(unit._onAttackStart, unit)
				);
			}
			this._effect_layer.addChild(grid);
			//this.setChildIndex(grid, 1);
			this.avail_grids.push(grid);
		}

		// add grid shader 
		this._ct_unit = unit;
	},

	clearAvailGrids: function() {
		//for (var i = 0; i < this.avail_grids.length; ++i) {
		//	this.removeChild(this.avail_grids[i]);
		//}
		this._effect_layer._removeAllChild();
		this.avail_grids = [];
		//for (var i = 0; i < this.attack_range.length; ++i) {
		//	this.removeChild(this.attack_range[i]);
		//}
		this.attack_range = [];
	},
	showMenu: function(unit) {
		// show attack button
		var button_atk = new Button(
			unit.getX() - 30, 
			unit.getY(),
			this._ui_layer,
			new arc.display.Sprite(system.getImage(CONFIG.UI.img_menu_atk))
		);
		button_atk.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(unit.prepareAttack, unit)
		);
		this._buttons.push(button_atk);

		//if (STAT < 200) {
			// show move button
			var button_mov = new Button(
				unit.getX() + 50, 
				unit.getY(),
				this._ui_layer,
				new arc.display.Sprite(system.getImage(CONFIG.UI.img_menu_mov))
			);
			button_mov.addEventListener(
				arc.Event.TOUCH_END, 
				//arc.util.bind(unit.prepareMove, unit)
				arc.util.bind(unit.restore, unit)
			);
			this._buttons.push(button_mov);
		//}
	},
	clearMenu: function() {
		this._ui_layer._removeAllChild();
		//for (var i = 0; i < this._buttons.length; ++i) {
		//	this.removeChild(this._buttons[i]);
		//}
		this._buttons = [];
	},
	showInfoBox: function(unit) {
		this.removeInfoBox();	
		this.infobox = new InfoBox(unit, this);
		this._ui_layer.addChild(this.infobox, 100);
	},
	showInfoBoxHurt: function(unit) {
		this.showInfoBox(unit);
		this.infobox.anim_hurt("cur_hp", unit.get("cur_hp") - unit._damage);
	},
	showInfoBoxExpUp: function(unit) {
		var unit = this._attacker;
		this.showInfoBox(unit);
		this.infobox.anim_exp("cur_exp", unit.get("exp") + unit._getExp);
	},
	removeInfoBox: function() {
		if (this.infobox == null) {
			return;
		}
		this._ui_layer.removeChild(this.infobox);
		this.infobox = null;

		if (STAT == 401) {
			// if defender dead
			// add extra exp
			if (this._defender.get("hp") == 0) {
				this._attacker.addExpKill(this._defender);
			}
			//this.showInfoBoxExpUp(this._attacker);
			setTimeout(
				arc.util.bind(this.showInfoBoxExpUp, this),
				200
			);

		}
		if (STAT == 501) {
			// level up animation
			if (this._attacker._levelup) {
				this._attacker.levelup();
				return;
			}	

			this._attacker.restore();
			this._defender.restore();
			this._attacker = null;
			this._defender = null;
		}
	},
	checkDead: function() {
		// callback for dead animation
		if (this._defender.get("cur_hp") <= 0) {
			STAT = 502;
			this._defender.die();
		} else {
			STAT = 0;
		}
	}
});

var Attr = arc.Class.create({
	_name: "Attr",
	name: null,
	lv: 0,
	school: null,
	hp: 0,
	mp: 0,
	atk: 0,
	def: 0,
	intl: 0,
	dex: 0,
	mor: 0,
	mov: 0,
	rng: 0,
	
	initialize: function(attr) {
		this.name = attr.name;
		this.lv = attr.lv;
		this.school = attr.school;
		this.hp = attr.hp;
		this.mp = attr.mp;
		this.atk = attr.atk;
		this.def = attr.def;
		this.intl = attr.intl;
		this.dex = attr.dex;
		this.mor = attr.mor;
		this.mov = attr.mov;
		this.rng = attr.rng;
		this.cur_hp = attr.cur_hp ? attr.cur_hp : this.hp;
		this.cur_mp = attr.cur_mp ? attr.cur_mp : this.mp;
		this.exp = attr.exp ? attr.exp : 0;
		this.min_exp = attr.min_exp;
		this.max_exp = attr.max_exp;
	},
});

var Unit = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "Unit",
	_stat: 0,
	_d: 0,
	_map: null,
	_attr: null,

	initialize: function(map, unit_conf) {
		var attr = unit_conf.attr;
		var position = unit_conf.position;
		var resource = unit_conf.resource;
		
		// for future use
		this._attr = new Attr(attr);
		this._moveStack = [];

		this._map = map;
		this._d = position.d;
		this.setX(position.i * CONFIG.const.SIZE);
		this.setY(position.j * CONFIG.const.SIZE);
		// laod resoruce according unit type
		this.anim_mov = new arc.display.MovieClip(4, true, true); 
		this.anim_stand = new arc.display.MovieClip(2, true, true);
		this.anim_attack = new arc.display.MovieClip(10, false, false);
		this.anim_hurt = new arc.display.MovieClip(2, false, false);
		this.anim_defence = new arc.display.MovieClip(1, false, false);
		this.anim_levelup = new arc.display.MovieClip(8, false, false);
		this.anim_attrup = new arc.display.MovieClip(10, false, false);
		this.anim_die = new arc.display.MovieClip(8, false, false);

		this._stand = [];
		this._move = [];
		this._attack = [];
		this._pattack = [];
		this._weak = new arc.display.SheetMovieClip(
			system.getImage(
				resource.img_mov, 
				[0, 192, 96, 48]
			),
			48, 2
		);
		this._hurt = new arc.display.SheetMovieClip(
			system.getImage(
				resource.img_spc, 
				[0, 96, 48, 48]
			),
			48, 2
		);
		this._turn_round = new arc.display.SheetMovieClip(
			system.getImage(
				resource.img_spc, 
				[0, 0, 192, 48]
			),
			48, 8, true
		);
		this._powerup = new arc.display.Sprite(
			system.getImage(
				resource.img_spc,
				[48, 96, 48, 48]
			)
		);
		for (var i = 0; i <= 3; ++i) {
			this._move[i] = new arc.display.SheetMovieClip(
				system.getImage(
					resource.img_mov, 
					[0, i * 48, 96, 48]
				), 
				48, 4
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._stand[i] = new arc.display.SheetMovieClip(
				system.getImage(
					resource.img_mov, 
					[0, i * 48, 96, 48]
				), 
				48, 2, true
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._attack[i] = new arc.display.SheetMovieClip(
				system.getImage(
					resource.img_atk, 
					[0, i * 64, 256, 64]
				), 
				64, 10
			);
		}
		for (var i = 0; i <= 3; ++i) {
			this._pattack[i] = new arc.display.SheetMovieClip(
				system.getImage(
					resource.img_atk, 
					[0, i * 64, 64, 64]
				), 
				64, 10, false, true
			);
		}
		//this._attack[this._d].addEventListener(
		this.anim_attack.addEventListener(
			arc.Event.COMPLETE,
			arc.util.bind(this._onAttackComplete, this)
		);
		this.anim_die.addEventListener(
			arc.Event.COMPLETE,
			arc.util.bind(this._onDead, this)
		);
		this.anim_levelup.addEventListener(
			arc.Event.COMPLETE,
			arc.util.bind(this._onLevelUpComplete, this)
		);


		this.addChild(this._stand[this._d]);
		this._stand[this._d].play();
		this.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(this._onClick, this)
		);
		this.addEventListener(
			arc.Event.TOUCH_MOVE,
			arc.util.bind(this._onDrag, this)
		);
	},
	_onDrag: function(e) {
		if (STAT == 0) {
			this._map.showInfoBox(this);
			STAT = 101;
		}
	},

	// while unit is clicked 
	// show menu
	_onClick: function(e) {
		console.log("_onClick: " +STAT);
		if (STAT >= 300) {
			return;
		} else if (STAT == 200) {
			this._map.clearAvailGrids();
			this._map.showMenu(this);
			//this.restore();
			return;
		} else if (STAT > 101) {
			return;
		} else if (STAT == 101) {
			this.restore();
			return;
		} else if (STAT == 100) {
			this._map.clearMenu();
			this._map.showInfoBox(this);
			STAT = 101;
			return;
		} else if (STAT == 0) {
			STAT = 100;
			this.prepareMove();
		} else {	
			// Exceptions
			this.restore();
		}
	},

	// ------------------
	// move functions
	// ------------------

	// prepare to move
	// this is the entrance of UNIT MOVE
	prepareMove: function() {
		if (STAT != 100) {
			return;
		}
		this._map.clearMenu();
		this._map.showAvailGrids(this);
		STAT = 200;
	},

	_onMoveStart: function(e) {
		console.log("onMoveStart !! " + STAT);
		if (STAT != 200) {
			return;
		}
		this._map.clearAvailGrids();
		
		// here we should remember original location
		// for cancel operation
		this._orig_x = this.getX();
		this._orig_y = this.getY();

		STAT = 201;
		var t = e.target;
		var stack = t.stack;

		var grid = this._map.getUnit(t.getX(), t.getY());
		if (grid != null) {
			alert("There is another unit!");
			STAT = 200;
			return;
		}

		this._moveStack = stack;
		this.nextMove();
	},
	nextMove: function() {
		//console.log("nextMove called");
		if (this._moveStack.length > 0) {
			var next_move = this._moveStack.shift();
			//console.log(next_move);
			this.move(next_move.d, next_move.l);
		} else {
			// TODO: 
			// should let unit stand still
			// instead of play moving animation
			this.stand();
			this._map.showMenu(this);
		}
	},
	move: function(direction, length) {
		//console.log("move ("+direction+","+length+")");
		this._removeAllChild();
		//this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}, 3:{}, 4:{}});
		this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}});
		this._d = direction;

		var cx = this.getX();
		var cy = this.getY();
	
		var tx = cx;
		var ty = cy;

		if (direction == 0) {
			ty += length * CONFIG.const.SIZE;
		} else if (direction == 1) {
			ty -= length * CONFIG.const.SIZE;
		} else if (direction == 2) {
			tx -= length * CONFIG.const.SIZE;
		} else if (direction == 3) {
			tx += length * CONFIG.const.SIZE;
		}
			
		this._cur_anim = new arc.anim.Animation(
			this.anim_mov,
			//{x: tx - cx, y: ty - cy},
			{x: tx - cx, y: ty - cy, time: 500 * length}
		);
		
		this.tx = tx;
		this.ty = ty;
		
		this._cur_anim.play();
		this._cur_anim.addEventListener(
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
		this._cur_anim = null;
		//console.log(this.tx + " : " + this.ty);
		this.nextMove();
	},


	// -------------------------
	// attack functions
	// -------------------------

	// prepare to attack
	// this is the entrance of UNIT ATTACK
	prepareAttack: function() {
		if (STAT >= 300) {
			return;
		}
		this._map.clearMenu();
		this._map.showAttackRange(this);
		STAT = 300;
	},
	_onAttackStart: function(e) {
		console.log("_onAttackStart: " + STAT);
		if (STAT != 300) {
			return;
		}

		STAT = 301;
		
		var t = e.target;
		
		// get enemy unit
		var defenders = [];
		this._map.defenders = [];
		
		this._atk_enemy = this._map.getUnit(t.getX(), t.getY());

		if (this._atk_enemy == null) {
			alert("There is no enemy unit!");
			STAT = 300;
			return;
		}

		// double link
		this._atk_enemy._attacker = this;
		this._map._attacker = this;
		this._map._defender = this._atk_enemy;
		
		for (var i = 0; i < defenders.length; ++i) {
			this._map._defenders.push(defenders[i]);
		}


		var d = 0;	
		if (t.getX() > this.getX()) {
			d = 3;
		} 
		else if (t.getX() < this.getX()) {
			d = 2;
		}
		else if (t.getY() < this.getY()) {
			d = 1;
		}
		this._map.clearAvailGrids();
		this.attack(d);
	},


	attack: function(direction) {
		this._d = direction;

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
		this.anim_attack.setX(-1 * CONFIG.const.MERGIN);
		this.anim_attack.setY(-1 * CONFIG.const.MERGIN);
		this.anim_attack.gotoAndPlay(1);
	},
	_onAttackComplete: function() {
		// enemy hurt animation
		// ...callback
		this._atk_enemy.hurt(this);
		// enemy hp/mp change animation
		// ...callback
		
		//this.restore();
		//this._atk_enemy = null;
	},

	stand: function() {
		this._removeAllChild();
		if (this.get("cur_hp") / this.get("hp") < 0.2) {
			this.anim_stand.addChild(this._weak, {1:{}, 2:{}});
		} else {
			this.anim_stand.addChild(this._stand[this._d], {1:{}, 2:{}});
		}
		this.addChild(this.anim_stand);
	},

	restore: function(stat) {
		this.initListener();		
		this.stand();
		this._map.clearMenu();
		this._map.removeInfoBox();
		this._map.clearAvailGrids();
		STAT = stat ? stat : 0;
	},
	initListener: function() {
		this.removeEventListener(arc.Event.TOUCH_END);
		this.addEventListener(
			arc.Event.TOUCH_END, 
			arc.util.bind(this._onClick, this)
		);
	},

	// animations without direction
	hurt: function(attacker) {
		this._removeAllChild();
	
		
		this.anim_hurt.addChild(this._hurt, {1: {}, 2: {}});
		this.addChild(this.anim_hurt);
		
		this.anim_hurt.removeEventListener(arc.Event.COMPLETE);
		this.anim_hurt.addEventListener(
			arc.Event.COMPLETE,
			arc.util.bind(attacker.removeAtkAnim, attacker)
		);

		this.anim_hurt.gotoAndPlay(1);

		var dmg = this.calDamage();
		this._map._attacker.calExp(this, dmg);

		this.setDamage(dmg);
	},
	levelup: function() {
		this._removeAllChild();
		this.anim_levelup.addChild(
			this._turn_round, 
			{
				1: {visible: true},
				2: {},
				3: {},
				4: {},
				5: {},
				6: {},
				7: {},
				8: {},
				9: {},
				10: {},
				11: {visible: false}
			}
		);
		this._turn_round.gotoAndStop(1);
		this.anim_levelup.addChild(
			this._powerup, 
			{
				1: {visible: false},
				11: {visible: true},
				12: {},
				13: {},
				14: {},
				15: {},
				16: {}
			}
		);
		this.addChild(this.anim_levelup);
		this.anim_levelup.gotoAndPlay(1);
	},
	_onLevelUpComplete: function() {
		this._levelup = false;
		this.restore();
		console.log(this.get("name")+"等级提升至"+this.get("lv")+"级！");
		this._map.checkDead();
	},
	removeAtkAnim: function() {
		console.log("removeAtkAnim");
		this.restore();
		// should change to moltiple
		this._atk_enemy.showDamageInfoBox();
	},
	showDamageInfoBox: function() {
		this.restore();
		
		// InfoBox animation
		this._map.showInfoBoxHurt(this);
	},
	calDamage: function() {
		var cur_hp = this.get("cur_hp");
		if (cur_hp >= 10) {
			this._damage = 10;
			return 10;
		} else {
			this._damage = cur_hp;
			return cur_hp;
		}
	},
	calExp: function(defender, dmg) {
		var lvDiff = defender.get("lv") - this.get("lv");
		var exp = parseInt(dmg / 10) + lvDiff;
		if (exp < 5) {
			exp = 5;
		}
		//this._getExp = exp;
		this._getExp = 100;
	},
	addExpKill: function(defender) {
		var lvDiff = defender.get("lv") - this.get("lv");
		var exp = 30 + lvDiff;
		if (exp < 10) {
			exp = 10;
		}
		this._getExp += exp;
	},
	setDamage: function(dmg) {
		if (dmg <= 0) {
			return;
		}
		this._dmgTxt = new arc.display.TextField();
        this._dmgTxt.setX(0);
        this._dmgTxt.setY(0);
		this._dmgTxt.setColor(0xffffff);
        this._dmgTxt.setFont("Helvetica", 13, false);
		this._dmgTxt.setText(dmg);
		this.addChild(this._dmgTxt);
	},
	weak: function() {
		this._removeAllChild();
		this.anim_stand.addChild(this._weak, {1:{}, 2:{}});
		this.addChild(this.anim_stand);
	},
	die: function() {
		this._removeAllChild();
		this.anim_die.addChild(
			this._weak, 
			{
				1: {visible: true },
				2: {visible: false},
				3: {visible: true},
				4: {visible: false},
				5: {visible: true},
				6: {visible: false},
				7: {visible: true},
				8: {visible: false},
			}
		);
		this.addChild(this.anim_die);
		this.anim_die.gotoAndPlay(1);
	},
	_onDead: function() {
		this._map._unit_layer.removeChild(this);
		this._map.checkDead();
	},
	power_up: function() {
	},
	getMap: function() {
		return this._map;
	},
	get: function(property) {
		return this._attr[property];
	},
	set: function(property, value) {
		if (property == null || value == null || this._attr[property] == null) {
			return;
		} else {
			this._attr[property] = value;
		}
	}
});

var InfoBox = arc.Class.create(arc.display.DisplayObjectContainer, {
	_name: "InfoBox",
	_stat: 0,
	_map: null,
	_unit: null,

	initialize: function(unit, map) {
		this._unit = unit;
		this._map = map;
		this.setBasePoint(unit.getX(), unit.getY());
	
		this.setBase();
		this.setName(unit.get("name"));
		this.setLv(unit.get("lv"));
		this.setSchool(unit.get("school"));
		this.setHp(unit.get('hp'), unit.get('cur_hp'));
		this.setMp(unit.get('mp'), unit.get('cur_mp'));
		this.setExp(unit.get('exp'));
		this.setTerrain(unit.get('terrain'));
	},
	setBasePoint: function(x, y) {
		if (x >= CONFIG.const.system.width / 2) {
			this.setX(x - 4 * CONFIG.const.SIZE);
		} else {
			this.setX(x + CONFIG.const.SIZE);
		}
		if (y >= CONFIG.const.system.height / 2) {
			this.setY(y - CONFIG.const.SIZE);
		} else {
			this.setY(y);
		}
	},
	setBase: function() {
		this._base = new arc.display.Sprite(system.getImage(CONFIG.Menu.base));
		this.addChild(this._base);
	},
	setName: function(name) {
		if (name == null) {
			return;
		}
        this._nameTxt = new arc.display.TextField();
        this._nameTxt.setX(10);
        this._nameTxt.setY(5);
        //this._nameTxt.setAlign(arc.display.Align.CENTER);
		this._nameTxt.setColor(0xffffff);
        this._nameTxt.setFont("Helvetica", 16, false);
		this._nameTxt.setText(name)
        this.addChild(this._nameTxt);
	},
	setLv: function(lv) {
		if (lv == null) {
			return;
		}
        this._lvTxt = new arc.display.TextField();
        this._lvTxt.setX(60);
        this._lvTxt.setY(5);
        //this._lvTxt.setAlign(arc.display.Align.CENTER);
		this._lvTxt.setColor(0xffffff);
        this._lvTxt.setFont("Helvetica", 16, false);
		this._lvTxt.setText("等级: "+lv)
        this.addChild(this._lvTxt);
	},
	setSchool: function(school) {
		if (school == null) {
			return;
		}
        this._schoolTxt = new arc.display.TextField();
        this._schoolTxt.setX(130);
        this._schoolTxt.setY(5);
        //this._schoolTxt.setAlign(arc.display.Align.CENTER);
		this._schoolTxt.setColor(0xffffff);
        this._schoolTxt.setFont("Helvetica", 16, false);
		this._schoolTxt.setText(school)
        this.addChild(this._schoolTxt);
	},
	setHp: function(hp, cur_hp) {
		if (hp == null || cur_hp == null) {
			return;
		}
		this.hp = hp;
		this.cur_hp = cur_hp;
		this._hp_update_step = parseInt(this.hp * 0.05);

		// set hp image
		var img_hp = new arc.display.Sprite(system.getImage(CONFIG.Menu.heart));
		img_hp.setX(10);
		img_hp.setY(25);
		this.addChild(img_hp);

		// set hp bar
		this.bar_hp = new arc.display.Sprite(
			system.getImage(
				CONFIG.Menu.hp, 
				[0, 0, 1, 8]
			)
		);
		this.bar_hp.setX(45);
		this.bar_hp.setY(33);
		var rate = parseInt((this.cur_hp / this.hp) * 130);
		this.bar_hp.setScaleX(rate);
		this.addChild(this.bar_hp);

	
		// set hp number
		this._hpTxt = new arc.display.TextField();
        this._hpTxt.setX(100);
        this._hpTxt.setY(30);
		this._hpTxt.setColor(0xffffff);
        this._hpTxt.setFont("Helvetica", 15, true);
		this._hpTxt.setText(" /  " + hp);
		this.addChild(this._hpTxt);	

		this._curHpTxt = new arc.display.TextField();
        this._curHpTxt.setX(75);
        this._curHpTxt.setY(30);
		this._curHpTxt.setColor(0xffffff);
        this._curHpTxt.setFont("Helvetica", 15, true);
		this._curHpTxt.setText(cur_hp);
		this.addChild(this._curHpTxt);	

	},
	setMp: function(mp, cur_mp) {
		if (mp == null || cur_mp == null) {
			return;
		}
	
		this.mp = mp;
		this.cur_mp = cur_mp;
		this._mp_update_step = parseInt(this.mp * 0.05);

		// set hp image
		var img_mp = new arc.display.Sprite(system.getImage(CONFIG.Menu.magic));
		img_mp.setX(10);
		img_mp.setY(50);
		this.addChild(img_mp);

		// set hp bar
		this.bar_mp = new arc.display.Sprite(
			system.getImage(
				CONFIG.Menu.mp, 
				[0, 0, 1, 8]
			)
		);
		this.bar_mp.setX(45);
		this.bar_mp.setY(58);
		var rate = parseInt((this.cur_mp / this.mp) * 130);
		this.bar_mp.setScaleX(rate);
		this.addChild(this.bar_mp);

		this.cur_mp = cur_mp;

		// set hp number
		this._mpTxt = new arc.display.TextField();
        this._mpTxt.setX(100);
        this._mpTxt.setY(55);
		this._mpTxt.setColor(0xffffff);
        this._mpTxt.setFont("Helvetica", 15, true);
		this._mpTxt.setText(" /  " + mp);
		this.addChild(this._mpTxt);	

		this._curMpTxt = new arc.display.TextField();
        this._curMpTxt.setX(75);
        this._curMpTxt.setY(55);
		this._curMpTxt.setColor(0xffffff);
        this._curMpTxt.setFont("Helvetica", 15, true);
		this._curMpTxt.setText(cur_mp);
		this.addChild(this._curMpTxt);	

	},
	setExp: function(exp) {
		if (exp == null) {
			return;
		}
		this._expTxt = new arc.display.TextField();
        this._expTxt.setX(10);
        this._expTxt.setY(80);
		this._expTxt.setColor(0xffffff);
        this._expTxt.setFont("Helvetica", 13, false);
		this._expTxt.setText("经验值：" + exp);
		this.addChild(this._expTxt);	

		this.cur_exp = exp;
		this._exp_update_step = 3;
	},
	setTerrain: function(terrain) {
		//if (terrain == null) {
		//	return;
		//}
        this._terrainTxt = new arc.display.TextField();
        this._terrainTxt.setX(120);
        this._terrainTxt.setY(80);
        //this._schoolTxt.setAlign(arc.display.Align.CENTER);
		this._terrainTxt.setColor(0xffffff);
        this._terrainTxt.setFont("Helvetica", 13, false);
		this._terrainTxt.setText(
			/* TODO: implement Terrain related features
			this._map.getTerrainInfo(
				this._unit.getX(), 
				this._unit.getY()
			)
			*/
			"平地 100%"
		);
        this.addChild(this._terrainTxt);
	},
	anim_hurt: function(tgtAttr, tgtNum) {
		if (tgtAttr == null || this[tgtAttr] == null || tgtNum == null) {
			return;
		}
		if (this[tgtAttr] != tgtNum) {
			STAT = 400;
			INFOBOX = this;
			this._tgtAttr = tgtAttr;
			this._tgtNum = tgtNum;
		}
	},
	anim_heal: function() {
	
	},
	anim_exp: function(tgtAttr, tgtNum) {
		if (tgtAttr == null || this[tgtAttr] == null || tgtNum == null) {
			return;
		}
		if (this[tgtAttr] != tgtNum) {
			STAT = 500;
			INFOBOX = this;
			this._tgtAttr = tgtAttr;
			this._tgtNum = tgtNum < 100 ? tgtNum : 100;
		}
	},
	setStatus: function() {
	},
	show: function() {
	},
	update: function() {
		if (this._tgtAttr == null || this._tgtNum == null) {
			return;
		}
		if (this._tgtAttr == "cur_hp") {
			if (this.cur_hp < this._tgtNum - this._hp_update_step) {
				this.cur_hp += this._hp_update_step;
			} else if (this.cur_hp > this._tgtNum + this._hp_update_step) {
				this.cur_hp -= this._hp_update_step;
			} else if (this.cur_hp == this._tgtNum) {
				if (STAT == 400) {
					setTimeout(
						arc.util.bind(this._map.removeInfoBox, this._map),
						500
					);
					STAT = 401;
					this._unit.set("cur_hp", this.cur_hp);
					this._tgtNum = 0;
					this._tgtAttr = null;
				} else {
					return;
				}
			} else {
				this.cur_hp = this._tgtNum;
			}
			var rate = parseInt((this.cur_hp / this.hp) * 130);
			this.bar_hp.setScaleX(rate);
			this._curHpTxt.setText(this.cur_hp);
		} else if(this._tgtAttr == "cur_exp") {
			// 或者经验值涨到100，或者涨到目标值
			// 动画停止
			if (this.cur_exp < this._tgtNum - this._exp_update_step) {
				this.cur_exp += this._exp_update_step;
			} else {
				this.cur_exp = this._tgtNum;
				if (STAT == 500) {
					setTimeout(
						arc.util.bind(this._map.removeInfoBox, this._map),
						500
					);
					STAT = 501;
					var tgtExp = this._unit.get("exp") + this._unit._getExp;
					this._unit.set("exp", tgtExp % 100);
					if (tgtExp >= 100) {
						this._unit._levelup = true;
						this._unit.set("lv", 
							this._unit.get("lv") + parseInt(tgtExp / 100)
						);
					}
					this._tgtNum = 0;
					this._tgtAttr = null;
				} else {
					return;
				}
			}
			this._expTxt.setText("经验值：" + this.cur_exp);
		}
	},
});

