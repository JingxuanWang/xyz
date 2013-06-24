enchant();

var GAME;
var CONFIG;
var CONSTS;
var BATTLE;
var MAP;



// make functions called in assigned scope
// which means binding 'this' variable 
// when function is called
function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	};
}
// deap copy a object
function clone(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = {};
	//var temp = obj.constructor(); // changed

	for(var key in obj)
		temp[key] = clone(obj[key]);
	return temp;
}

// sum up some prop in an array of objects
function sumByProp(arr, prop) {
	return arr.map(function(k) {
		return k[prop];
	}).reduce(function(a, b) {
		return a + b;
	});
}

// sum up some prop in an array of objects
function sumByFunc(arr, func) {
	return arr.map(function(k) {
		return func(k);
	}).reduce(function(a, b) {
		return a + b;
	});
}

// sort an object array by it's property
function sortByProp(arr, prop, order) {
	return arr.sort(function(a, b) {
		return order * (a[prop] - b[prop]);
	});
}

//Schwartzian transform
function sortByFunc(arr, func, order) {
	return arr.map(function (x) {
		return [x, func(x)];
	}).sort(function (a, b) {
		return order * (a[1] - b[1]);
	}).map(function (x) {
		return x[0];
	});
}

function lot(arr, func, total_prob) {
	if (totla_prop == null) {
		total_prob = sumByFunc(arr, func);
	}
	var r = rand(1, total_prob); // 1 ~ total_prob
	for (var i = 0; i < arr.length; i++) {
		rand -= func(arr);
		if (rand < 0) {
			return arr[i];
		}	
	}
}

// return random integers in [min, max];
function rand(min, max) {
	return Math.floor((Math.random() * (max - min + 1)) + min);
}
var Consts = enchant.Class.create({
	classname: "Consts",
	initialize: function() {
		this.INFINITE = 999999;
		this.direction = {
			DOWN: 0,
			RIGHT: 1,
			UP: 2,
			LEFT: 3,
		};
		this.side = {
			PLAYER: 0,
			ALLIES: 1,
			ENEMY: 2,
			ENEMY_ALLIES: 3,
			NUTRUAL: 4,
		};
		this.unit_status = {
			// common status
			NORMAL: 0,
			MOVED: 1,		// not recommend to use
			ACTIONED: 2,

			// extra
			POISON: 11,

			// special status
			HIDE: 20,
				
			// dead
			DEAD: -1,
		};
		this.battle_status = {
			INIT: 0,
			SCENARIO: 1,
			NORMAL: 100,
			MOVE_RNG: 101,
			MOVE: 102,
			ACTION_SELECT: 103,
			ACTION_RNG: 104,
			ACTION: 105,
			
			WIN: 900,
			LOSE: 901,
			DRAW: 902
		};
		this.attack_type = {
			NONE: 0,

			RANGE_1: 1,
			RANGE_2: 2,
			RANGE_3: 3,
			RANGE_4: 4,
			RANGE_5: 5,
			
			ARCHER_1: 11,
			ARCHER_2: 12,
			ARCHER_3: 13,

			LANCER_1: 21,
			LANCER_2: 22,
			LANCER_3: 23,

			CATAPULT_1: 31,
			CATAPULT_2: 32,
			CATAPULT_3: 33,

			MAGIC_1: 91,
			MAGIC_2: 92,
			MAGIC_3: 93,
		
			FULL_SCREEN: 99,
		};
		this.terrain = {
			BARRIER: -5,
			MOUNTAIN: -4,
			WALL: -3,
			SHIP: -2,
			FIRE: -1,
			GROUND: 0,
			ROAD: 1,
			GRASSLAND: 2,
			WASTELAND: 3,
			MARSH: 4,
			SNOW: 5,
			HILL: 6,
			RIVER: 7,
			BRIDGE: 8,
			HOUSE: 11,
			VILLAGE: 12,
			CAMP: 13,
			CASTLE: 14,
		};
		this.unit_type = {
			swordman: 1,
			lancer: 2,
			warrior: 3,
			soldier: 4,

			horseman: 11,
			lighthorseman: 12,
			heavyhorseman: 13,

			archer: 21,
			horsearcher: 22,
			crossbowman: 23,

			cartroit: 31,
			lighthcartroit: 32,
			heavyhcartroit: 33,

			wizard: 41,
			
			// debug
			"群雄": 90,
			"轻步兵": 91,
		};
		this.ai = {
			DUMMY: 0,			// do nothing, just skip
			HOLD_POSITION: 1,	// do not move, but attack unit within attack range
			MOVE_POSITION: 2,	// move to position, but not attack
			ATTACK_POSITION: 3,	// move to position, attack if possible
			ATTACK_UNIT: 4,		// pursue a target unit and attack if possible
			KILL_ALL: 5,		// attack all enemy units
			FOLLOW_UNIT: 6,		// follow a friendly unit
			FOLLOW_ATTACK: 7,	// follow a friendly unit, attack if possible
			
			NONE: 999			// player control, not a ai		
		};
	},
	getUnitTypeName: function(t) {
		for (var ut in this.unit_type) {
			if (this.unit_type[ut] == t) {
				return ut;
			}
		}
		return "NO_NAME";
	},
	_noop: function(){}
});
var Ajax = enchant.Class.create(enchant.EventTarget, {
	classname: "Ajax",
	_method: 'GET', 
	_params: null, 
	_url: null,
	_request: null, 
	_jsonResponse: null, 

	initialize: function(){
		enchant.EventTarget.call(this);
		this._request = new XMLHttpRequest();
		this._loadedCallBack = bind(this._loaded, this);
	},
	load: function(url, params){
		this._url = url;
		this._params = params;
		this._request.open(this._method, this._url, true);
		this._request.onreadystatechange = bind(this._loaded, this);
		this._request.addEventListener('readystatechange', this._loadedCallback, false);
		this._request.send(this._params);
	},
	_loaded: function(){
		if(this._request.readyState == 4){
			if(this._request.status == 200 || this._request.status === 0){
				this.dispatchEvent(new enchant.Event(enchant.Event.LOAD));
			} else {
				this.dispatchEvent(new enchant.Event(enchant.Event.ERROR));
				throw new Error("Load Error : " + this._url);
			}
		}
	},
	unload: function(){
		this._request.abort();
		this._jsonResponse = null;
		this._request.removeEventListener('readystatechange', this_loadedCallback, false);
	},
	setMethod: function(method){
		this._method = method;
	},
	getResponseText: function(){
		return this._request.responseText;
	},
	getResponseJSON: function(){
		if(!this._jsonResponse){
			this._jsonResponse = JSON.parse(this._request.responseText);
		}
		return this._jsonResponse;
	},
	getURL: function(){
		return this._url;
	}
});
var Config = enchant.Class.create({
	classname: "Config",
	initialize: function(){
	},
	load: function(callback) {
		var self = this;
		var ajax = new Ajax();
		ajax.addEventListener(enchant.Event.LOAD, function() {
			self._all = ajax.getResponseJSON();
			self._text = ajax.getResponseText();
			callback.call();
		});
		ajax.load('js/xyz.json');
	},
	get: function(arr) {
		var a = this._all;
		for (var i = 0; i < arr.length; i++) {
			if (a.hasOwnProperty(arr[i])) {
				a = a[arr[i]];
			} else {
				return null;
			}
		}
		return a;
	},
	// ajax utilities
	_noop: function() {}
});

var xyzMap = enchant.Class.create(enchant.Map, {
	classname: "xyzMap",
	initialize: function(conf) {
		enchant.Map.call(this, conf.tileWidth, conf.tileHeight);

		this.image = GAME.assets[conf.image];

		// for an assigned map
		// use data matrix
		if (conf.data.length > 0) {
			this.loadData(conf.data);
		} 
		// if map not assigned by data matrix
		// then generate a default one
		else {
			var matrix = [];
			for (var i = 0; i < conf.width; i++) {
				matrix[i] = [];
				for (var j = 0; j < conf.height; j++) {
					matrix[i][j] = i * conf.width + j;
				}
			}
			this.loadData(matrix);
		}

		// load terrain_data
		if (conf.terrain_data.length > 0) {
			this.terrain_data = conf.terrain_data;
		}

		// movement matrix
		this._movement_matrix = [];
		for (var t in CONSTS.terrain) {
			if (this.isPassible(CONSTS.terrain[t])) {
				this._movement_matrix[CONSTS.terrain[t]] = [];
				for (var ut in CONSTS.unit_type) {
					// TODO: this should be changed later
					this._movement_matrix[CONSTS.terrain[t]][CONSTS.unit_type[ut]] = 1;
				}
			}
		}
	},
	getCols: function() {
		return this.width * this.tileWidth;
	},
	getRows: function() {
		return this.height * this.tileHeight;
	},
	x2j: function(x) {
		return ~~((x - this.x) / this.tileWidth);
	},
	y2i: function(y) {
		return ~~((y - this.y) / this.tileHeight);
	},
	getTerrain: function(x, y) {
		return this.terrain_data[this.y2i(y)][this.x2j(x)];
	},
	getTerrainName: function(x, y) {
		return "平地";
	},
	getTerrainInfo: function(x, y) {
		return 100;
	},
	isInMap: function(x, y) {
		var i = this.y2i(y);
		var j = this.x2j(x);
		if (j >= 0 && j <= this.width &&
			i >= 0 && i <= this.height) {
			return true;
		}
		return false;
	},
	isPassible: function(terrain, school) {
		// there may be terrains 
		// that only allow units in some schools to pass
		return terrain >= 0;
	},
	getReqMovement: function(terrain, school) {
		if (this.isPassible(terrain)) {
			return this._movement_matrix[terrain][school];
		} else {
			return -1;
		}
	},
	// BFS get available grids 
	// according to unit position and range
	getAvailGrids: function(unit, rng, type) {
		var src = {
			x: ~~(unit.x),
			y: ~~(unit.y),
			r: rng,
			route: [],
		};
		var queue = [];
		var avail_grids = [];
		var self = this;

		// function within getAvailGrids
		// it can 'see' variables defined in getAvailGrids
		var isValid = function (cur) {
			if (!self.isInMap(cur.x, cur.y)) {
				return false;
			}
			if (cur.x == src.x && cur.y == src.y) {
				return false;
			}
			if (cur.r < 0) {
				return false;
			}
			var terrain = self.getTerrain(cur.x, cur.y);
			// impassible
			if (type == "MOV" && !self.isPassible(terrain, unit.attr.current.school)) {
				return false;
			}
			// remain movement > 0
			// but movement is not enough for this grid
			if (cur.r + 1 < self.getReqMovement(terrain, unit.attr.current.school)) {
				return false;
			}
			if (type == "MOV" && BATTLE.hitUnit(cur.x, cur.y, CONSTS.side.ENEMY)) {
				return false;
			}

			for (var i = 0; i < avail_grids.length; i++) {
				if (avail_grids[i].x == cur.x && avail_grids[i].y == cur.y) {
					return false;
				}
			}
			return true;
		};

		queue.push(src);
		while(queue.length > 0) {
			var cur = queue.shift();
			if (isValid(cur)) {
				cur.route.push({x: ~~(cur.x), y: ~~(cur.y), d: cur.d});
				avail_grids.push(cur);
			}
			var up = {
				x: ~~(cur.x),
				y: ~~(cur.y - unit.height),
				r: ~~(cur.r - 1),
				d: CONSTS.direction.UP,
				route: cur.route.slice(),
			};
			var down = {
				x: ~~(cur.x),
				y: ~~(cur.y + unit.height),
				r: ~~(cur.r - 1),
				d: CONSTS.direction.DOWN,
				route: cur.route.slice(),
			};		
			var left = {
				x: ~~(cur.x - unit.width),
				y: ~~(cur.y),
				r: ~~(cur.r - 1),
				d: CONSTS.direction.LEFT,
				route: cur.route.slice(),
			};		
			var right = {
				x: ~~(cur.x + unit.width),
				y: ~~(cur.y),
				r: ~~(cur.r - 1),
				d: CONSTS.direction.RIGHT,
				route: cur.route.slice(),
			};		
			if (isValid(down)) {
				queue.push(down);
			}
			if (isValid(right)) {
				queue.push(right);
			}
			if (isValid(up)) {
				queue.push(up);
			}
			if (isValid(left)) {
				queue.push(left);
			}
		}
		return avail_grids;
	},
	getAvailAtkGrids: function(unit, type) {
		if (type === CONSTS.attack_type.NONE) {
			return [];
		}
		else if (type <= CONSTS.attack_type.RANGE_5) {
			return this.getAvailGrids(unit, type, "ATK");			
		}
	},

	_noop: function() {}
});

var Attr = enchant.Class.create({
	classname: "Attr",
	name: null,
	chara_id : 0,
	level: 0,
	school: null,
	rank: null,
	hp: 0,
	mp: 0,
	atk: 0,
	def: 0,
	intl: 0,
	dex: 0,
	mor: 0,
	mov: 0,
	rng: 0,
	exp: 0,
	
	initialize: function(master_attr, cur_attr, unit) {
		if (master_attr == null) {
			throw new Error('master_attr undefined');	
		}
		if (unit == null) {
			throw new Error('unit undefined');	
		}
		this.unit = unit;

		this.master = {};
		this.current = {};
		this.last = {};

		this.master.chara_id = master_attr.chara_id;
		this.master.name = master_attr.name;
		this.master.level = master_attr.level;
		this.master.school = master_attr.school;
		this.master.rank = master_attr.rank;
		this.master.hp = master_attr.hp;
		this.master.mp = master_attr.mp;
		this.master.atk = master_attr.atk;
		this.master.def = master_attr.def;
		this.master.intl = master_attr.intl;
		this.master.dex = master_attr.dex;
		this.master.mor = master_attr.mor;
		this.master.mov = master_attr.mov;
		this.master.rng = master_attr.rng;
		this.master.exp = master_attr.exp;

		// init current & last
		for (var prop in this.master) {
			var value = cur_attr && cur_attr[prop] ? cur_attr[prop] : this.master[prop];
			this.current[prop] = value;
			this.last[prop] = value;
		}
	},
	master: {
		get: function() {
			return this._master;
		},
		set: function(m) {
			this._master = m;
		}
	},
	current: {
		get: function() {
			return this._current;
		},
		set: function(c) {
			this._current = c;
		}
	},
	last: {
		get: function() {
			return this._last;
		},
		set: function(l) {
			this._last = l;
		}
	},
	backup: function() {
		this._last = {};
		for (var prop in this._current) {
			this._last[prop] = this._current[prop];
		}
		this._last.i = this.unit.i;
		this._last.j = this.unit.j;
		this._last.d = this.unit.d;
	},
	resume: function() {
		this._current = {};
		for (var prop in this._last) {
			this._current[prop] = this._last[prop];
		}
	},
	_noop: function() {}
});

var Ai = enchant.Class.create(enchant.EventTarget, {
	classname: "Ai",

	initialize: function(conf, unit){
		enchant.EventTarget.call(this);
		this.type = CONSTS.ai[conf];
		this.unit = unit;
		if (this.type == null || this.unit == null) {
			throw new Error('Undefined ai parameter ' + conf + " : " + unit);
		}
		this.possible_actions = [];
	},
	// 0, determine round strategy at round start
	updateRoundStrategy: function() {

	},
	// 1, find all possible actions
	// 2, score all actions according to some specific rules
	getAvailActions: function() {
		// call getAvailGrids and move based on grids
		var grid = {
			x: ~~(this.unit.x),
			y: ~~(this.unit.y),
			r: ~~(this.unit.mov),
			d: ~~(this.unit.d),
			route: [],
		};
		var action = {};
		// Strategy that dont't allow moving
		if (this.type == CONSTS.ai.DUMMY) {
			action.type = this.type;
			action.orig = grid;
			action.move = null;
			action.score = this.scoreMove(null);
			action.action = null;
			this.possible_actions.push(action);			

			this.getPossibleAttack();
		}
		// Strategy that allow moving 
		else 
		{
			var grids = MAP.getAvailGrids(this.unit, this.unit.attr.mov, "ENEMY");
			for (var g = 0; g < grids.length; g++) {
			}
		}
	},
	// BFS, using a queue
	// possible actions on specific location
	getPossibleAttack: function() {
		for (var i = 0; i < this.possible_actions.length; i++) {
			var pa = this.possible_actions[i];
			var units = this.getInRangeUnits();
			for (var j = 0; j < units.length; j++) {		
				var action = clone(pa);
				action.presult = this.predictAttack(units[j]);
				this.scoreAttack(action.presult);
				this.possible_actinn.push();
			}
		}
	},
	getPossibleMagicAttack: function() {
	},
	getPossibleHeal: function() {
	},

	// get move scores according to strategy
	scoreMove: function(grid) {
		if (grid == null) {
			return 0;
		}
		return 10;
	},
	// get action scores according to strategy
	scoreAttack: function(presult) {
		var score = 0;
		if (presult.defender) {
			score += presult.defender.damage;
			if (presult.defender.status == 'DEAD') {
				score += CONSTS.INFINITE;
			}
		}
		if (presult.attacker) {
			score -= Math.round(presult.attacker.damage / 2);
			if (presult.attacker.status == 'DEAD') {
				score -= CONSTS.INFINITE;
			}
		}
		// maybe useful in the future
		if (presult.other) {

		}
		return score;
	},
	// 3, sort all actions according to score
	// 4, fetch randomly one action above the line
	determineAction: function() {
		sortByProp(this.possible_actions, score, -1);
		this.possible_actions.filter(this.isAboveLine);
		var index = rand(0, this.possible_actions.length - 1);
		return this.possible_actions[index];
	},
	isAboveLine: function(action) {
		return true;
	},
	_noop: function() {
	}
});

/*

	// action
	{
		type: 'none',
		move: [grid_obj],
		action: {
			type: 'attack',
			target: [target_obj]
			presult: {
				defender: {
					damage:
					status: 
				},
				attacker: {
					damage:
					status:
				},
			},
		},
		score: 100, 
	}
*/

// include chara and chara effect
var Unit = enchant.Class.create(enchant.Group, {
	classname: "Unit",
	initialize: function(conf) {
		enchant.Group.call(this);
		this.width = CONFIG.get(["map", "tileWidth"]);
		this.height = CONFIG.get(["map", "tileHeight"]);
		
		this.i = conf.position.i;
		this.j = conf.position.j;

		this.attr = new Attr(conf.master_attr, conf.cur_attr, this);

		this.action_end = false;
		this.weak_rate = 0.3;

		this._status = CONSTS.unit_status.NORMAL;
		this.ai = new Ai(conf.ai, this);

		this.chara = new Chara(conf);
		this.label = new Label("");
		this.label.color = '#ffffff';
		this.addChild(this.chara);
		this.addChild(this.label);
	},
	i: {
		get: function() {
			return Math.round(this.x / this.width);
		},
		set: function(ti) {
			this.x = ti * this.width;
		}
	},
	j: {
		get: function() {
			return Math.round(this.y / this.height);
		},
		set: function(ty) {
			this.y = ty * this.height;
		}
	},
	d: {
		get: function() {
			return this.chara.d;
		},
		set: function(td) {
			this.chara.d = td;
		}
	},
	animMove: function(route, onMoveComplete) {
		// for each waypoint
		var tl = this.tl;
		var d = this._cur_direction;
		var c = 0;
		for (var i = 0; i < route.length; i++) {
			d = route[i].d;
			// 后边d值变化了，覆盖了前面的值
			// 导致之前放入回调函数里的d值也变化了
			tl = tl.action({
				time: 0,
				onactionstart: function() {
					console.log("onactinostart :" + d + " : " + route[c].d);
					this.move(route[c].d);
					++c;
				},
			}).moveTo(route[i].x, route[i].y, 20);
		}
		tl = tl.then(function() {
			this.moveTo(Math.round(this.x), Math.round(this.y));
		});
		var self = this;
		tl = tl.then(function() {
			onMoveComplete.call(this, self);
		});
	},
	isOnBattleField: function() {
		if (this._status == CONSTS.unit_status.HIDE || 
			this._status == CONSTS.unit_status.DEAD) {
			return false;
		}
		return true;
	},
	canMove: function() {
		if (this._status != CONSTS.unit_status.MOVED && 
			this._status != CONSTS.unit_status.ACTIONED && 
			this._status != CONSTS.unit_status.HIDE && 
			this._status != CONSTS.unit_status.DEAD) {
			return true;
		}
		return false;
	},
	canLevelUp: function() {
		return this.side == CONSTS.side.PLAYER && 
			this.attr.current.exp >= this.attr.master.exp;
	},
	attack: function(d) {
		this.chara.setAnim("ATTACK", d);
	},
	move: function(d) {
		this.chara.setAnim("MOVE", d);
	},
	resume: function(d) {
		if (d) {
			this.d = d;
		}
		this.label.text = "";
		// sync cur attr 
		if (this.attr.current.hp <= this.attr.master.hp * this.weak_rate) {
			this.chara.setAnim("WEAK", this.d);
		} else {
			if (this._status == CONSTS.unit_status.ACTIONED) {
				this.chara.setAnim("STAND", this.d);
			} else {
				this.chara.setAnim("MOVE", this.d);
			}
		}
	},
	stand: function() {
		if (this._status == CONSTS.unit_status.ACTIONED) {
			this.chara.setAnim("STAND", this.d);
		}
	},
	hurt: function(damage) {
		this.chara.setAnim("HURT", this.d);
		this.label.text = damage;
	},
	levelUp: function() {
		this.chara.setAnim("LEVEL_UP", this.d);
		console.log("level up to " + this.attr.current.level);
	},
	die: function() {
		this.chara.setAnim("WEAK", this.d);
		this.chara.blink = true;
		this._status = CONSTS.unit_status.DEAD;
	},
	_noop: function() {

	}
});

var Chara = enchant.Class.create(enchant.Sprite, {
	classname: "Chara",
	initialize: function(conf) {
		enchant.Sprite.call(
			this, 
			conf.position.i * CONFIG.get(["map", "tileWidth"]),
			conf.position.j * CONFIG.get(["map", "tileHeight"])
		);

		this.blink = false;

		// should be initialized
		this.width = CONFIG.get(["map", "tileWidth"]);
		this.height = CONFIG.get(["map", "tileHeight"]);
		//console.log("Chara.initialized:  x: " + this.x + " y: " + this.y + " width: " + this.width + " height: " + this.height);
		this._status = CONSTS.unit_status.NORMAL;
		
		this._anims = {
			"ATTACK" : {
				"asset" : conf.resource.img_atk,
				"frames" : [0, 0, 0, 0, 1, 2, 3, 3, 3, 3],
				// df stand for direction factor
				"df" : 4,
				"fps" : 10,
				"loop" : false,
				"width" : 64,
				"height" : 64
			},
			"MOVE" : {
				"asset" : conf.resource.img_mov,
				"frames" : [0, 1],
				"df" : 2,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"WEAK" : {
				"asset" : conf.resource.img_mov,
				"frames" : [8, 9],
				"df" : 0,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"STAND" : {
				"asset" : conf.resource.img_spc,
				"frames" : [0],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"DEFEND" : {
				"asset" : conf.resource.img_spc,
				"frames" : [4],
				"df" : 1,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"HURT" : {
				"asset" : conf.resource.img_spc,
				"frames" : [8],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"WIN" : {
				"asset" : conf.resource.img_spc,
				"frames" : [9],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"LEVEL_UP" : {
				"asset" : conf.resource.img_spc,
				"frames" : [5, 6, 7, 4, 5, 6, 7, 4, 9, 9, 9, 9],
				"df" : 0,
				"fps" : 8,
				"loop" : false,
				"width" : 48,
				"height" : 48
			}

		};

		//this.setAnim("MOVE", conf.position.d);
		this.setAnim("MOVE", conf.position.d);
		
		this.addEventListener("enterframe", function(){
			if (this.shouldPlayNextFrame()) {
				this.setCurAnimNextFrame();
			}
			if (this.blink == true) {
				if (this.age % 15 > 7) {
					this.opacity = 1;
				} else {
					this.opacity = 0;
				}
			}
		});
	},
	d: {
		get: function() {
			return this._cur_direction;
		},
		set: function(td) {
			this._cur_direction = td;
		}
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this.d) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._cur_anim.frames.length; i++) {
			frames[i] = this._cur_anim.frames[i] + this._cur_anim.df * direction;
		}
		// set first frame
		this.frame = frames[this._cur_frame];

		this.d = direction;
		this._last_frame_update = this.age; 
	},
	// called when sprite image size changed
	_adjustNewSize: function(newWidth, newHeight) {
		this.x += (this.width - newWidth) / 2;
		this.y += (this.height - newHeight) / 2;
		this.width = newWidth;
		this.height = newHeight;
		//console.log("Chara._adjustNewSize: " + this.x + " : " + this.y + " : " + this.width + " : " + newWidth);
	},
	// status, asset, fps, frame num should be assigned
	setAnim: function(anim, direction, frame_num){
		if (anim == null || (direction == null && this.d == null)) {
			console.log("Error Chara.setAnim: " + anim + " : " + direction);
			return;
		}
		if (direction !== null) {
			this.d = direction;
		}

		this.image = GAME.assets[this._anims[anim].asset];
		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._anims[anim].frames.length; i++) {
			frames[i] = this._anims[anim].frames[i] + this._anims[anim].df * this.d;
		}
		if (!frame_num) {
			frame_num = 0;
		} else {
			frame_num = frame_num % frames.length;
		}
		// set first frame
		this.frame = frames[frame_num];
		this._adjustNewSize(this._anims[anim].width, this._anims[anim].height);

		this._cur_anim = this._anims[anim];
		this._cur_frame = frame_num;
		this._last_frame_update = this.age;
		//console.log("Chara: setAnim: " + this._cur_frame + " : " + frames.length);
	},
	getCurAnimTotalFrameNum: function() {
		return this._cur_anim.frames.length == null ? this._cur_anim.frames.length : 0;	
	},
	setCurAnimFrameNum: function(num) {
		if (this._cur_anim.frames.length == 1 && num > 1) {
			console.log("Error Chara.setCurAnimFrameNum: No other frame to set");
			return;
		}
		if (this._cur_anim.frames.length == num + 1) {
			if (this._cur_anim.loop === false) {
				this.dispatchEvent(new enchant.Event("onactionend"));
				return;
			}
		}

		num = num % this._cur_anim.frames.length;
		this._cur_frame = num;
		this._last_frame_update = this.age;
		this.frame = this._cur_anim.frames[num] + this._cur_anim.df * this.d;
		//console.log("Chara: setCurAnimFrameNum: " + this._cur_frame + " : " + this.frame + " : " + this.age);
	},
	setCurAnimNextFrame: function() {
		//console.log("Chara: setCurAnimNextFrame: " + this._cur_frame + " : " + this.age);
		this.setCurAnimFrameNum(this._cur_frame + 1);
	},
	shouldPlayNextFrame: function() {
		//console.log("Chara: shouldPlayNextFrame: " + this._cur_frame + " : " + this.age);
		var next_frame = ~~((this.age % GAME.fps) / GAME.fps * this._cur_anim.fps);
		return next_frame == this._cur_frame ? true : false;
	},
	noop: function() {}
}); 

var MoveShade = enchant.Class.create(enchant.Sprite, {
	classname: "MoveShade",
	initialize: function(grid, width, height, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		this.image = GAME.assets[CONFIG.get(["UI", "mov_base"])];
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});

	},
	_noop: function() {}	
});

var AttackShade = enchant.Class.create(enchant.Sprite, {
	classname: "AttackShade",
	initialize: function(grid, width, height, type, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		if (type === "ATK") {
			this.image = GAME.assets[CONFIG.get(["UI", "atk_base"])];
		} else {
			this.image = GAME.assets[CONFIG.get(["UI", "ar"])];
		}
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});
	},

	_noop: function() {}	
});

// containts button & label & image
var Menu = enchant.Class.create(enchant.Group, {
	classname: "Menu",
	buttons: ["atk", "mov"],
	initialize: function(x, y, unit, cb_list) {
		this.drawBackround();
		for (var i = 0; i < buttons.length; i ++) {
			var type = buttons[i];
			var cb = cb_list[type];
			addButton(x, y, w, h, type, cb);
		}
	},
	drawBackground: function() {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	addButton: function(type, cb) {
		var button = new Button(x, y, w, h, type, cb);
		this.addChild(button);
	},
	_noop: function() {}	
});


// a button contains a image and a lable
var Button = enchant.Class.create(enchant.Group, {
	classname: "Button",
	initialize: function(x, y, image, text, cb) {
		enchant.Group.call(this, w, h);
		this.addLabel(text);
		this.moveTo(x, y);
		this.width = 40;
		this.height = 40;
		this.drawBackground();

		if (type == "atk") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_atk"])]);
		} else if (type == "mov") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_mov"])]);
		} else {
			console.log("invalide type");
		}

		this._pressed = false;
		this.addEventListener(enchant.Event.TOUCH_START, function() {
			this._pressed = true;
			this.y++;
			this.changeStyle();
			callback.call();
		});
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			this._pressed = false;
			this.y--;
			this.changeStyle();
			callback.call();
		});
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	changeStyle: function() {
		// currently only the background
		if (this._pressed === true) {
			this.bg.image.context.fillStyle = '#fff';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		} else {
			this.bg.image.context.fillStyle = '#333';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		}
	},
	addImage: function(image) {
		// fixed width/height
		var img = new Sprite(32, 32);
		img.image = image;
		img.moveTo(2, 2);
		this.img = img;
		this.addChild(img);
	},
	addLabel: function(text) {
		var lb = new Label(text);
		lb.moveTo(36, 2);
		this.lb = lb;
		this.addChild(lb); 
	},
	_noop: function() {}	

});

// contains hp/mp bar & label & image
var InfoBox = enchant.Class.create(enchant.Group, {
	classname: "InfoBox",
	initialize: function(unit, type, onAnimComplete) {
		enchant.Group.call(this);
		this.unit = unit;
		this.side = unit.side;
		this.type = type;
		this.width = 192;
		this.height = 96;
		this._in_anim = false;
		this.onAnimComplete = onAnimComplete;

		if (this.side == CONSTS.side.PLAYER && this.type == "ATK") {
			this.height = 144;
		}

		this.setBasePoint(this.unit.x, this.unit.y);
		this.drawBackground(GAME.assets[CONFIG.get(["Menu", "base"])]);

		this.setName();
		this.setLevel();
		this.setSchool();
			this.setHpStat();
			this.setMpStat();
		if (this.side == CONSTS.side.PLAYER && this.type == "ATK") {
			this.setExpStat();
		}
		if (this.type != "ATK") {
			this.setTerrainStat();
		}
	
		// check animation status
		// and trigger event when status change
		this.addEventListener('enterframe', function() {
			this.updateAnimStatus();
		}); 
	},
	change: function(attr) {
		this.hp_stat.value = attr.hp;
	},
	syncHp: function() {
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	setBasePoint: function(x, y) {
		if (x >= CONFIG.get(["system", "width"]) / 2) {
			this.x = x - 4 * CONFIG.get(["map", "tileWidth"]);
		} else {
			this.x = x + CONFIG.get(["map", "tileWidth"]);
		}
		if (y >= CONFIG.get(["system", "height"]) / 2) {
			if (this.side == CONSTS.side.PLAYER && this.type == "ATK") {
				this.y = y - 2 * CONFIG.get(["map", "tileHeight"]);
			} else {
				this.y = y - CONFIG.get(["map", "tileHeight"]);
			}
		} else {
			this.y = y;
		}
	},
	setName: function() {
		this.name = new Label(this.unit.attr.current.name);
		this.name.color = '#ffffff';
		this.name.moveTo(10, 5);
		this.addChild(this.name);
	},
	setLevel: function() {
		this.level = new Label("Lv. " + this.unit.attr.current.level);
		this.level.color = '#ffffff';
		this.level.moveTo(60, 5);
		this.addChild(this.level);
	},
	setSchool: function() {
		this.school = new Label(CONSTS.getUnitTypeName(this.unit.attr.current.school));
		this.school.color = '#ffffff';
		this.school.moveTo(130, 5);
		this.addChild(this.school);
	},
	setTerrainStat: function() {
		var terrain_name = MAP.getTerrainName(this.unit.x, this.unit.y);
		var terrain_info = MAP.getTerrainInfo(this.unit.x, this.unit.y);
		this.terrain = new Label(
			terrain_name + " " + terrain_info + "%"	
		);
		this.terrain.color = '#ffffff';
		this.terrain.moveTo(120, 80);
		this.addChild(this.terrain);
	},

	setHpStat: function() {
		var bl = 35;
		// image
		this.hp_img = new Sprite(24, 24);
		this.hp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "hp"])];
		this.hp_img.moveTo(10, bl - 5);
		this.addChild(this.hp_img);
		// bar & lable
		this.hp_stat = new TextBar(130, 8, 
			this.unit.attr.last.hp, 
			this.unit.attr.master.hp
		);
		this.hp_stat.bar.value = this.unit.attr.current.hp;

		this.hp_stat.bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "hp"])];
		this.hp_stat.moveTo(45, bl - 3);

		this.addChild(this.hp_stat);
	},
	setMpStat: function() {
		var bl = 60;
		// image
		this.mp_img = new Sprite(24, 24);
		this.mp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "mp"])];
		this.mp_img.moveTo(10, bl - 5);
		this.addChild(this.mp_img);
		// bar & lable
		this.mp_stat = new TextBar(130, 8, 
			this.unit.attr.last.mp, 
			this.unit.attr.master.mp
		);
		this.mp_stat.bar.value = this.unit.attr.current.mp;

		this.mp_stat.bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "mp"])];
		this.mp_stat.moveTo(45, bl - 3);

		this.addChild(this.mp_stat);
	},
	setExpStat: function() {
		var bl = 85;
		// image
		this.exp_img = new Sprite(24, 24);
		this.exp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "exp"])];
		this.exp_img.moveTo(10, bl - 5);
		this.addChild(this.exp_img);
		// bar & lable
		this.exp_stat = new TextBar(130, 8, 
			this.unit.attr.last.exp, 
			this.unit.attr.master.exp
		);
		// if current.exp < last.exp
		// it means there is a level up
		// so we should redefine actions
		if (this.unit.attr.current.exp < this.unit.attr.last.exp) {
			// LEVEL UP
			this.exp_stat.bar.value = this.unit.attr.master.exp;
		} else {
			// NO LEVEL UP
			this.exp_stat.bar.value = this.unit.attr.current.exp;
		}

		this.exp_stat.bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "exp"])];
		this.exp_stat.moveTo(45, bl - 3);

		this.addChild(this.exp_stat);
	},
	// check if it is in an animation
	updateAnimStatus: function() {
		if (this._in_anim == true) {
			if (this.checkStatus() == false) {
				this._in_anim = false;
				// to sync unit's attr
				this.unit.attr.backup();
				this.onAnimComplete.call(this);
			}
		} else {
			if (this.checkStatus() == true) {
				this._in_anim = true;
			}
		}
	},
	// check if status is changing
	checkStatus: function() {
		if (this.hp_stat.bar.is_changing()) {
			return true;
		}
		if (this.mp_stat.bar.is_changing()) {
			return true;
		}
		if (this.exp_stat && this.exp_stat.bar.is_changing()) {
			return true;
		}
		return false;
	},
	_noop: function() {}	
});

/*
   // Bar
	var bar = new Bar(20, 100);
	bar.image = game.assets["bar.png"];
	bar.maxvalue = 200;
	bar.value = 0;
	bar.on("enterframe", function() {
		if (this.age % 60 == 0) {
			this.value = Math.random() * 200;
		}   
	}); 
	game.rootScene.addChild(bar);
*/
var TextBar = enchant.Class.create(enchant.Group, {
	initialize: function(w, h, curVal, maxVal) {
		if (curVal == null || maxVal == null) {
			throw new Error('Undefined value ' + curVal + " " + maxVal);
		}
		enchant.Group.call(this);
		this.bar = new Bar(w, h, w, curVal, maxVal);
		this.bar.moveTo(0, 5);

		this.label = new Label(Math.round(curVal) + " / " + Math.round(maxVal));
		this.label.color = '#ffffff';
		this.label.textAlign = 'center';
		this.label.width = w - 40;
		this.label.font = '14pt Helvetica';
		this.label.moveTo(20, -2);
		// move label to the middle of the bar

		this.addChild(this.bar);
		this.addChild(this.label);

		this.addEventListener('enterframe', function() {
			this.label.text = Math.round(this.bar.curvalue) + 
				" / " + Math.round(this.bar.maxvalue);
		});
	}
});

var Bar = enchant.Class.create(enchant.Sprite, {
	initialize: function(w, h, maxwidth, curVal, maxVal) {
		enchant.Sprite.call(this, w, h);
		this.image = new enchant.Surface(w, h);// Null用
		this.image.context.fillColor = 'RGB(0, 0, 256)';
		this.image.context.fillRect(0, 0, w, h);
		this._direction = 'right';
		this._origin = 0;
		this._maxvalue = maxVal;
		this._lastvalue = curVal;
		this.value = curVal;
		this.easing = 10;
		this._maxwidth = maxwidth;

		// initialize
		this.width = this._lastvalue;

		this.addEventListener('enterframe', function() {
			if (this.value < 0) {
				this.value = 0;
			}
			this._lastvalue += (this.value - this._lastvalue) / this.easing;
			if (Math.abs(this._lastvalue - this.value) < 1.3) {
				this._lastvalue = this.value;
			}
			this.width = Math.round((this._lastvalue / this._maxvalue) * this._maxwidth) | 0;
			if (this.width > this._maxwidth) {
				this.width = this._maxwidth;
			}
			if (this._direction === 'left') {
				this._x = this._origin - this.width;
			} else {
				this._x = this._origin;
			}
			this._updateCoordinate();
		});
	},
	is_changing: function() {
		return this.value != this.curvalue;
	},
	direction: {
		get: function() {
			return this._direction;
		},
		set: function(newdirection) {
			if (newdirection !== 'right' && newdirection !== 'left') {
				// ignore
			} else {
				this._direction = newdirection;
			}
		}
	},
	x: {
		get: function() {
			return this._origin;
		},
		set: function(x) {
			this._x = x;
			this._origin = x;
			this._dirty = true;
		}
	},
	maxvalue: {
		get: function() {
			return this._maxvalue;
		},
		set: function(val) {
			this._maxvalue = val;
		}
	},
	// readonly 
	// returns current value
	curvalue: {
		get: function() {
			return this._lastvalue;
		},
		set: function(val) {
			this._lastvalue = val;
		},
	}
});


var BattleScene = enchant.Class.create(enchant.Scene, {
	classname: "BattleScene",
	initialize: function() {
		enchant.Scene.call(this);
		this.round = 0;
		this.max_round = CONFIG.get(["map", "mission", "max_round"]);
		this.win_conds = [];
		this.lose_conds = [];
		// TODO: implement this later
		this.scenario_conds = [];
		this.scenario_cb = [];

		this.actor = null;

		this._status = CONSTS.battle_status.INIT;
		this._units = [];
		this._player_units = [];
		this._allies_units = [];
		this._enemy_units = [];
		this._touch_origin_x = 0;
		this._touch_origin_y = 0;

		this.map_max_x = 
			CONFIG.get(["map", "tileWidth"]) * CONFIG.get(["map", "width"]);
		this.map_max_y = 
			CONFIG.get(["map", "tileHeight"]) * CONFIG.get(["map", "height"]);
		this.map_min_x = 0;
		this.map_min_y = 0;

		this.min_x = CONFIG.get(["system", "width"]) - this.map_max_x;
		this.min_y = CONFIG.get(["system", "height"]) -  this.map_max_y;
		this.max_x = 0;
		this.max_y = 0;

		// these layers are difference from 
		// the ones defined in enchant.js
		// here are only big childs 
		// that used for determine children depth
		this.map_layer = new Group();
		this.effect_layer = new Group();
		this.unit_layer = new Group();
		this.ui_layer = new Group();

		this.addChild(this.map_layer);
		this.addChild(this.effect_layer);
		this.addChild(this.unit_layer);
		this.addChild(this.ui_layer);

		this.addMap(CONFIG.get(["map"]));
		this.addUnits(CONFIG.get(["player_unit"]), CONSTS.side.PLAYER);
		this.addUnits(CONFIG.get(["allies_unit"]), CONSTS.side.ALLIES);
		this.addUnits(CONFIG.get(["enemy_unit"]), CONSTS.side.ENEMY);

		this.addEventListener(enchant.Event.TOUCH_START, this.onTouchStart);
		this.addEventListener(enchant.Event.TOUCH_MOVE, this.onTouchMove);
		this.addEventListener(enchant.Event.TOUCH_END, this.onTouchEnd);

		this.addEventListener(enchant.Event.ENTER, this.onEnter);
		this.addEventListener(enchant.Event.EXIT, this.onExit);
	},
	// scene methods
	// these do not override default ones
	onEnter: function() {
		// enter and re-enter
		// pop push will trigger this 
	},
	onExit: function() {
		// pop push will trigger this 
	},

	// method that handle click events
	onTouchStart: function(evt) {
		// status check
		if (false) {
			return; 
		}

		this._touch_origin_x = evt.x;
		this._touch_origin_y = evt.y;
		this._origin_x = this.x;
		this._origin_y = this.y;
	},
	onTouchMove: function(evt) {
		// status check
		if (false) {
			return; 
		}

		this.x = this._origin_x + evt.x - this._touch_origin_x;
		this.y = this._origin_y + evt.y - this._touch_origin_y;
		
		// border check
		if (this.x < this.min_x){
			this.x = this.min_x;
		}
		if (this.x > this.max_x){
			this.x = this.max_x;
		}
		if (this.y < this.min_y){
			this.y = this.min_y;
		}
		if (this.y > this.max_y){
			this.y = this.max_y;
		}
	},
	onTouchEnd: function(evt) {
		// Big Status Machine
		//console.log("Battle clicked: " + evt.x + " : " + evt.y + " : " + this._status);
		var unit;
		if (this.turn != CONSTS.side.PLAYER) {
			console.log("NOT PLAYER'S TURN, IGNORE THIS EVENT");
			return;
		}

		if (this._status == CONSTS.battle_status.NORMAL) {
			this.removeInfoBox();
			unit = this.getUnit(evt.x, evt.y);
			// only map or exception
			if (unit != null) {
				if (unit.side == CONSTS.side.PLAYER) {
					this.onUnitSelect(unit, CONSTS.side.PLAYER);
				} else if (unit.side == CONSTS.side.ENEMY) {
					this.onUnitSelect(unit, CONSTS.side.ENEMY);
				}
			}
		}
		else if (this._status == CONSTS.battle_status.MOVE_RNG) {
			unit = this.getUnit(evt.x, evt.y);
			if (unit == this._selected_unit) {
				this.removeShades();
				this.showInfoBox(unit);
				this._status = CONSTS.battle_status.NORMAL;
			}
		}
		else if (this._status == CONSTS.battle_status.MOVE) {
			// if there is a touch event at this phrase
			// it means to finish this animatin immediately
			// TODO:
			//this.finishCurMove();
		}
		else if (this._status == CONSTS.battle_status.ACTION_RNG) {
			unit = this.getUnit(evt.x, evt.y);
			shade = this.getShade(evt.x, evt.y);
			// only map or exception
			if (unit != null && shade != null) {
				shade.dispatchEvent(evt);
				this._status = CONSTS.battle_status.ACTION;
			}
		}
		else if (this._status == CONSTS.battle_status.ACTION) {
			// do nothing
		}
		// default is skip 
		else {
			console.log("Status: " + this._status + " can not handle this click, skip");
		}
	},

	// battle control framework
	// initialize
	battleStart: function() {
		this.round = 0;
		//this.turn = CONSTS.side.PLAYER;
		//this._status = CONSTS.battle_status.NORMAL;
		this.roundStart();
	},
	// battle end
	battleEnd: function(result) {
		// server communication
	},
	// preprocess logic before each round
	// to set all units' _status flag etc.
	roundStart: function() {
		this.round++;
		console.log("ROUND " + this.round + " START !!!");
		for (var s in this._units) {
			var units = this._units[s];
			for (var i = 0; i < units.length; i++) {
				if (units[i].isOnBattleField()) {
					units[i]._status = CONSTS.unit_status.NORMAL;
					units[i].resume();
				}
			}
		}
		// call scenario first
		// this.scenario();

		// this should be the callback
		// as the scenario finishes
		this.turnStart(CONSTS.side.PLAYER);
	},
	// enemy turn finishes and round end
	// there maybe round condition check here
	roundEnd: function() {
		// round check
		// this.battleEnd("lose");
		//if (this.conditionJudge(this.win_conds)) {
		if (false) {
			this.battleEnd(CONSTS.battle_status.WIN);
		//} else if (this.conditionJudge(this.lose_conds)) {
		} else if (false) {
			this.battleEnd(CONSTS.battle_status.LOSE);
		} else {
			/*
			var ret = this.conditionJudge(this.scenario_conds)
			if (ret) {
				this.scenario_cb[ret].call();
			}*/
			this.roundStart();
		}
	},
	// what should we do before a turn ?
	turnStart: function(side) {
		// a new scene for "PLAYER TURN"/"ENEMY TURN"
		// GAME.pushScene("...");
		this.turn = side;
		if (side == CONSTS.side.ENEMY) {
			// Enemy AI
			for (var i = 0; i < this._units[CONSTS.side.ENEMY].length; i++) {
				var enemy = this._units[CONSTS.side.ENEMY][i];
				if (enemy && enemy.canMove()) {
					var action_script = enemy.ai.determineAction(enemy);
					// action according the script
					this.actionStart(enemy, action_script);
					return;
				}
			}

			// if there is no enemy
			this.turnEnd();
		} else if (side == CONSTS.side.ALLIES) {
			// Allies AI

			this.turnEnd();
		} else if (side == CONSTS.side.PLAYER) {
			this._status = CONSTS.battle_status.NORMAL;
		}

	},
	// judge if it is a next turn or next round
	turnEnd: function() {
		if (this.turn == CONSTS.side.ENEMY) {
			this.roundEnd();
		} else if (this.turn == CONSTS.side.PLAYER) {
			this.turnStart(CONSTS.side.ALLIES);
		} else if (this.turn == CONSTS.side.ALLIES) {
			this.turnStart(CONSTS.side.ENEMY);
		}
	},
	actionStart: function(unit, action_script) {
		if (unit.side == CONSTS.side.PLAYER) {
			this.actor = unit;
			this.actor.attr.backup();
			this.showMoveRng(unit, false);
		} else if (unit.side == CONSTS.side.ALLIES) {
			this.actionEnd();
		} else if (unit.side == CONSTS.side.ENEMY) {
			if (action_script == null || action_script.action == 'none') {
				this.actionEnd();
			} else if (action_script.action == 'move') {
				// ...
			} else if (action_script.action == 'attack') {
				// ...
			}
		}
	},
	// used for enemy action
	actionPhase: function() {
	},
	actionCancel: function() {
		this.actor._status = CONSTS.unit_status.NORMAL;
		this.actor.moveTo(this.actor.attr.last.j, this.actor.attr.last.i);
		this.actor.resume(this.actor.attr.last.d);
		this.actor = null;
		this._status = CONSTS.battle_status.NORMAL;
	},
	// called when action is completed
	// remove infobox/menu/shade
	// and call turn check
	actionEnd: function() {
		this._status = CONSTS.battle_status.NORMAL;
		this.actor._status = CONSTS.unit_status.ACTIONED;
		this.actor.stand();
		this.actor = null;

		this.removeShades();
		this.removeMenu();
		this.removeInfoBox();

		//turn check
		var next_unit = this.turnCheck(this.turn);
		// for player only
		if (next_unit != null) {
			if (this.turn == CONSTS.side.PLAYER) {
				// do nothing
			} else {
				// ai pick next unit to move
				var action_script = next_unit.ai.determineAction();
				this.actionStart(next_unit, action_sctipt);
			}
		}
		// switch to player/allies/enemy turn 
		else {
			if (this.turn == CONSTS.side.PLAYER) {
				// pop up to inform user of turn change
				// this.turnEnd(); //this should be callback
				this.turnEnd();
			} else {
				this.turnEnd();
			}
		}
	},

	conditionJudge: function(conds, callback) {
		for (var i = 0; i < conds.length; i++) {
			if (this.condReached(conds[i])) {
				callback.call();
				return;
			}
		}
	},
	condReached: function(cond) {
		return true;
	},

	// pre-assign units
	// no animation here 
	addUnits: function(units, side) {
		for (var i = 0; i < units.length; i++) {
			var unit = new Unit(units[i]);
			unit.side = side;
			if (!this._units[side]) {
				this._units[side] = [];
			}
			this._units[side].push(unit);
			if (!unit.hide) {
				this.unit_layer.addChild(unit);
			}
		}
	},
	// map utilities
	addMap: function(conf) {
		if (this.map) {
			this.reomveChild(this.map);
		}
		var map = new xyzMap(conf);
		this.map_layer.addChild(map);
		map.battle = this;
		this.map = map;
		MAP = map;
	},
	isMap: function(target) {
		return target === this.map;
	},
	removeShades: function() {
		if (this._atk_shade) {
			this.effect_layer.removeChild(this._atk_shade);
			this._atk_shade = null;
		}
		if (this._mov_shade) {
			this.effect_layer.removeChild(this._mov_shade);
			this._mov_shade = null;
		}
	},
	showMoveRng: function(unit, bind_callback) {
		this._status = CONSTS.battle_status.MOV_RNG;

		var self = this;
		var i = 0;
		var shade;
		this._move_grids = this.map.getAvailGrids(unit, unit.attr.current.mov, "MOV");
		this._atk_grids = this.map.getAvailAtkGrids(unit, unit.attr.current.rng);
		this._atk_shade = new Group();
		this._mov_shade = new Group();
	
		// TODO: this should be rewritten
		var move_shade_cb = function(grid) {
			self.removeShades();
			self.move(unit, grid);
		};

		for (i = 0; i < this._move_grids.length; i++) {
			shade = new MoveShade(
				this._move_grids[i],
				unit.width,
				unit.height,
				move_shade_cb
			);
			this._atk_shade.addChild(shade);
		}
		this.effect_layer.addChild(this._atk_shade);
		
		var atk_shade_cb = function(grid) {
			self.removeShades();
			self.move(unit, grid);
		};

		for (i = 0; i < this._atk_grids.length; i++) {
			shade = new AttackShade(
				this._atk_grids[i],
				unit.width,
				unit.height,
				"MOV",
				atk_shade_cb
			);
			this._mov_shade.addChild(shade);
		}
		this.effect_layer.addChild(this._mov_shade);
	},
	showAtkRng: function(unit) {
		this._status = CONSTS.battle_status.ACTION_RNG;
		//console.log("show attack range" + this._atk_grids);
		var self = this;
		this._atk_grids = this.map.getAvailAtkGrids(unit, unit.attr.current.rng);
		var atk_shade_cb = function(grid) {
			self.removeShades();
			self.attack(unit, grid);
		};
		this._atk_shade = new Group();
		for (var i = 0; i < this._atk_grids.length; i++) {
			var shade = new AttackShade(
				this._atk_grids[i],
				unit.width,
				unit.height,
				"ATK",
				atk_shade_cb
			);
			this._atk_shade.addChild(shade);
		}
		this.effect_layer.addChild(this._atk_shade);
	},
	move: function(unit, shade) {
		if (this.getUnit(shade.x, shade.y)) {
			console.log("那里有其他单位不能移动");
			return;
		}	
		var route = shade.route;
		if (route) {
			this._status = CONSTS.battle_status.MOVE;
			unit.animMove(route, bind(this.showMenu, this));
		}
	},
	attack: function(unit, grid) {
		var enemy = this.getUnit(grid.x, grid.y);
		if (unit == null) {
			console.log("攻击者不存在");
			return;
		}
		if (enemy == null) {
			console.log("没有攻击对象");
			this.showMenu(unit);
			return;
		}
		this.infobox_queue = [];
		this.dead_queue = [];
		this.lvup_queue = [];

		this._status = CONSTS.battle_status.PLAYER_ACTION;
		var result = this.calcAttack(unit, enemy);
		this.animCharaAttack(result, bind(this.animCharaInfoBox, this));
	},

	turnCheck: function(side) {
		var units = this._units[side];
		for (var i = 0; i < units.length; i++) {
			if (units[i].canMove()) {
				return units[i];
			}	
		}
		return null;
	},
	//
	isPlayerTurn: function() {
		return this.turn == CONSTS.side.PLAYER;
	},
	isAlliesTurn: function() {
		return this.turn == CONSTS.side.ALLIES;
	},
	isEnemyTurn: function() {
		return this.turn == CONSTS.side.ENEMY;
	},

	// Menu
	showMenu: function(unit) {
		if (this._menu) {
			this.removeMenu();
		}
		var self = this;
		this._menu = new Group();
		// TODO: the coordinate and menu layout should be changed
		var atk_btn = new Sprite(32, 32);
		atk_btn.image = GAME.assets["img/menu/atk.png"]; 
		atk_btn.moveBy(- 16 - 32, 0);
		atk_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.removeShades();
			self.showAtkRng(unit);
		});

		var mov_btn = new Sprite(32, 32);
		mov_btn.image = GAME.assets["img/menu/mov.png"];
		mov_btn.moveBy(16, 0);
		mov_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.removeShades();
			self.actionEnd();
		});

		this._menu.addChild(atk_btn);
		this._menu.addChild(mov_btn);

		this._menu.moveTo(~~(unit.x + unit.width / 4), ~~(unit.y - unit.height / 2));
		this.ui_layer.addChild(this._menu);
		this._status = CONSTS.battle_status.ACTION_RNG;
	},
	removeMenu: function() {
		if (this._menu) {
			this.ui_layer.removeChild(this._menu);
			this._menu = null;
		}
	},
	isMenu: function(target) {
		return target === this._menu;
	},

	// infobox
	showInfoBox: function(unit, type, onAnimComplete) {
		this._infobox = new InfoBox(unit, type, onAnimComplete);
		this.ui_layer.addChild(this._infobox);
	},
	removeInfoBox: function() {
		if (this._infobox) {
			this.ui_layer.removeChild(this._infobox);
			this._infobox = null;
		}	
	},
	isInfoBox: function(target) {
		return target === this._infobox;
	},

	// Animation utilities
	animCharaAttack: function(attack_script, onAnimComplete) {
		if (attack_script == null) {
			console.log("empty attack_script");
			return;
		}
		var self = this;
		// for each round
		for (var i = 0; i < attack_script.length; i++) {
			var attacker = attack_script[i].a;
			var defender = attack_script[i].d;
			var damage = attack_script[i].ad;
			var type = attack_script[i].t; 
			var exp = attack_script[i].ae;
			var d = this.calcDirection(attacker, defender);
			var atl = attacker.tl;
			var dtl = defender.tl;
			if (type === "ATTACK") {
				atl = atl.action({
					time: 60,
					onactionstart: function() {
						attacker.attack(d);
					},
					onactionend: function() {
						defender.hurt(damage);
					}
				});
					
				atl = atl.delay(20).then(function() {
					attacker.resume();
					defender.resume();
					// last animtion completed
					if (i >= attack_script.length) {
						onAnimComplete.call(self);
					}
				});
			}
		}
	},
	// fetch from infobox queue
	// and play infobox animation one by one
	animCharaInfoBox: function() {
		var unit = this.infobox_queue.shift();
		if (unit != null) {
			this.tl.delay(10).then(function(){
				this.removeInfoBox();
				this.showInfoBox(unit, "ATK", bind(this.animCharaInfoBox, this));
			});
		} else {
			// no more infobox animation
			// resume to default status
			this.tl.delay(10).then(function(){
				this.removeInfoBox();
				this.animCharaLevelup();
			});
		}
	},
	animCharaLevelup: function() {
		var unit = this.lvup_queue.shift();
		if (unit != null) {
			// 1, level up (done)
			// 2, weapon level up
			// 3, armor level up
			this.tl.delay(30).action({
				time: 90,
				onactionstart: function() {
					unit.levelUp();
				},
				onactionend: function() {
					unit.resume();
					this.animCharaInfoBox();
				},
			});
		} else {
			// no more levelup animation
			this.tl.delay(30).then(function(){
				this.animCharaDie();
			});
		}
	},
	// there may be multiple units
	animCharaDie: function() {
		var unit = this.dead_queue.shift();
		if (unit != null) {
			this.tl.action({
				time: 60,
				onactionstart: function() {
					unit.die();
				},
				onactionend: function() {
					this.unit_layer.removeChild(unit);
					this.animCharaDie();
				}
			});
		} else {
			this.actionEnd();
		}
	},
	animCharaAppear: function(units) {

	},
	animCharaEscape: function(units) {
		
	},

	// numberic calculations
	calcRoute: function(unit, target) {
		var judgeDirection = function(src, dst) {
			if (src.x == dst.x && src.y > dst.y) {
				return CONSTS.direction.DOWN;
			}
			if (src.x == dst.x && src.y < dst.y) {
				return CONSTS.direction.UP;
			}
			if (src.x < dst.x && src.y == dst.y) {
				return CONSTS.direction.RIGHT;
			}
			if (src.x > dst.x && src.y == dst.y) {
				return CONSTS.direction.LEFT;
			}
		};
		var cur = {
			x: unit.x,
			y: unit.y
		};
		// return animation script	
		while (target.length > 0) {
			var next = target.shift();
			var d = judgeDirection(cur, next);
		}
	},
	// TODO: this will be a server request in the future
	calcAttack: function(attacker, defender) {
		if (attacker == null || defender == null) {
			console.log("Error Parameter" + attacker + " : " + defender);
			return;
		}

		this.infobox_queue.push(defender);
		this.infobox_queue.push(attacker);

		var attack_script = [];
		// attack
		var atk_dmg = this.calcAtkDamage(attacker, defender, "ATTACK");
		var atk_exp = this.calcExp(attacker, defender, atk_dmg);
		attack_script.push({
			t: "ATTACK",
			a: attacker,
			d: defender,
			ad: atk_dmg,
			ae: atk_exp
		});
		defender.attr.backup();
		defender.attr.current.hp -= atk_dmg;
		
		//attacker.attr.backup();
		attacker.attr.current.exp += atk_exp;

		// 可以封杀反击...
		if (false) {
			// retaliate
			atk_dmg = this.calcAtkDamage(defender, attacker, "RETALIATE");
			atk_exp = this.calcExp(attacker, defender, atk_dmg);
			attack_script.push({
				t: "RETALIATE",
				a: defender,
				d: attacker,
				rd: atk_dmg,
				re: atk_exp
			});
		}

		if (defender.attr.current.hp <= 0) {
			this.dead_queue.push(defender);
		}
		if (attacker.attr.current.hp <= 0) {
			this.dead_queue.push(attacker);
		}

		if (attacker.canLevelUp()) {
			attacker.attr.current.level += 
				~~(attacker.attr.current.level / attacker.attr.master.level);
			attacker.attr.current.exp %= attacker.attr.master.exp;
			this.lvup_queue.push(attacker);
		}

		return attack_script;
	},
	calcDirection: function(attacker, defender) {
		if (defender.x > attacker.x) {
			return CONSTS.direction.RIGHT;
		} else if (defender.x < attacker.x) {
			return CONSTS.direction.LEFT;
		} else {
			if (defender.y < attacker.y) {
				return CONSTS.direction.UP;
			} else {
				return CONSTS.direction.DOWN;
			}
		}
	},
	calcAtkDamage: function(attacker, defender) {
		return 50;
	},
	calcExp: function(attacker, defender, damage) {
		return 60;
	},
	// get all objects on this point
	// including map
	getChilds: function(x, y) {
		var units = [];
		for (var i = 0; i < this.childNodes.length; i++) {
			var node = this.childNodes[i];
			if (node.x <= x && x <= node.x + node.width && 
				node.y <= y && y <= node.y + node.height) {
				units.push(node);
			}
		}
		return units;
	},
	// get only units on this point
	getUnit: function(x, y, side) {
		for (var i = 0; i < this.unit_layer.childNodes.length; i++) {
			var node = this.unit_layer.childNodes[i];
			if (node.x <= x && x < node.x + node.width && 
				node.y <= y && y < node.y + node.height && 
				node.classname === "Unit") {
				return node;
			}
		}
		return null;
	},
	// is there a unit specific unit
	hitUnit: function(x, y, side) {
		var unit = this.getUnit(x, y);
		if (unit != null && unit.side == side) {
			return true;
		}
		return false;
	}, 
	getShade: function(x, y) {
		for (var i = 0; i < this.effect_layer.childNodes.length; i++) {
			var child = this.effect_layer.childNodes[i];
			for (var j = 0; j < child.childNodes.length; j++) {
				var node = child.childNodes[j];
				if (node.x <= x && x < node.x + node.width && 
					node.y <= y && y < node.y + node.height) {
					return node;
				}
			}
		}
		return null;
	},
	onUnitSelect: function(unit) {
		this._selected_unit = unit;
		if (unit.side == CONSTS.side.PLAYER) {
			if (unit.canMove()) {
				this.actionStart(unit);
			} else {
				console.log("This unit can not move!");
			}
		} else if (unit.side == CONSTS.side.ENEMY) {
			this.showInfoBox(unit);
		}
	},
	_noop: function(){
	}
});

// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	CONSTS = new Consts();
	CONFIG = new Config();
	CONFIG.load(function(){
		GAME = new Core(CONFIG.get(["system", "width"]), CONFIG.get(["system", "height"]));
		GAME.fps = 60;

		GAME.preload(CONFIG.get(["image"]));
		GAME.onload = function(){
			BATTLE = new BattleScene();
			GAME.pushScene(BATTLE);
			BATTLE.battleStart();
		};
		GAME.start();
	});
};
