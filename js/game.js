enchant();

var GAME;
var CONFIG;
var CONSTS;

function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	}
}

var Consts = enchant.Class.create({
	classname: "Consts",
	initialize: function() {
		this._directions = {
			DOWN: 0,
			RIGHT: 1,
			UP: 2,
			LEFT: 3,
		};
		this._unit_status = {
			// common status
			NORMAL: 0,
			MOVED: 1,
			ACTIONED: 2,
			// extra
			POISON: 11,
				
			// dead
			DEAD: -1,
		};
		this._battle_status = {
			INIT: 0,
			SCENARIO: 1,
			PLAYER_TURN: 100,
			PLAYER_UNIT_MENU: 101,
			PLAYER_UNIT_SHOW_RNG: 102,
			PLAYER_UNIT_ACTION: 103,
			ENEMY_TURN: 200,
			ENEMY_UNIT_ACTION: 201
		};
	},
	getDirection: function(d) {
		return this._directions[d];
	},
	getUnitStatus: function(st) {
		return this._unit_status[st];
	},
	getBattleStatus: function(st) {
		return this._battle_status[st];
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
			if(this._request.status == 200 || this._request.status == 0){
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
		ajax.load('js/data.json');
	},
	images: function() {
		return this._all['image'];
	},
	getMap: function() {
		return this._all['map'];
	},
	getSystem: function() {
		return this._all['system'];
	},
	getPlayerUnits: function() {
		return this._all['player_unit'];
	},
	getAlliesUnits: function() {
		return this._all['allies_unit'];
	},
	getEnemyUnits: function() {
		return this._all['enemy_unit'];
	},
	// ajax utilities
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
	
	initialize: function(attr) {
		this.chara_id = attr.chara_id;
		this.name = attr.name;
		this.level = attr.level;
		this.school = attr.school;
		this.rank = attr.rank;
		this.hp = attr.hp;
		this.mp = attr.mp;
		this.atk = attr.atk;
		this.def = attr.def;
		this.intl = attr.intl;
		this.dex = attr.dex;
		this.mor = attr.mor;
		this.mov = attr.mov;
		this.rng = attr.rng;
		this.exp = attr.exp ? attr.exp : 0;
		this.cur_hp = attr.cur_hp ? attr.cur_hp : this.hp;
		this.cur_mp = attr.cur_mp ? attr.cur_mp : this.mp;
		this.cur_exp = attr.cur_exp;
	},
	compare: function(attr) {
		for (var prop in this) {
			if (this[prop] != attr.prop) {
				return false;
			}
		}
		return true;
	}
});

var Chara = enchant.Class.create(enchant.Sprite, {
	classname: "Chara",
	initialize: function(conf) {
		enchant.Sprite.call(
			this, 
			conf.position.i * CONFIG.getMap().tileWidth, 
			conf.position.j * CONFIG.getMap().tileHeight
		);
		this._attr = new Attr(conf.attr);
		this._status = CONSTS.getUnitStatus("NORMAL");
		
		this._anims = {
			"ATTACK" : {
				"asset" : conf.resource.img_atk,
				"frames" : [0, 0, 0, 0, 0, 1, 2, 3],
				// df stand for direction factor
				"df" : 4,
				"fps" : 12,
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
				"frames" : [6, 7],
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
			}
		};

		this.setAnim("MOVE", conf.position.d);
		
		this.addEventListener("enterframe", function(){
			if (this.shouldPlayNextFrame()) {
				this.setCurAnimNextFrame();
			}
		});
	},
	setStatus: function(st) {
		if (UNIT_STATUS[st] === null) {
			console.log("Chara: setStatus undefined status: " + st);
		}
		this._status = UNIT_STATUS[st];
	},
	canMove: function() {
		if (this._status != CONSTS.getUnitStatus("MOVED")
		&& this._status != CONSTS.getUnitStatus("ACTIONED")
		&& this._status != CONSTS.getUnitStatus("DEAD")) {
			return true;
		}
		return false;
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this._cur_direction) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._cur_anim.frames.length; i++) {
			frames[i] = this._cur_anim.frames[i] 
				+ this._cur_anim.df * direction;
		}
		// set first frame
		this.frame = frames[this._cur_frame];

		this._cur_direction = direction;
		this._last_frame_update = this.age; 
	},
	// called when sprite image size changed
	_adjustNewSize: function(newWidth, newHeight) {
		this.x += (this.width - newWidth) / 2;
		this.y += (this.height - newHeight) / 2;
		this.width = newWidth;
		this.height = newHeight;
		//console.log(this.x + " : " + this.y + " : " + this.width + " : " + newWidth);
	},
	// status, asset, fps, frame num should be assigned
	setAnim: function(anim, direction, frame_num){
		if (anim === null || direction === null) {
			console.log("Error Chara.setAnim: " + anim + " : " + direction);
			return;
		}

		this.image = GAME.assets[this._anims[anim].asset];
		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._anims[anim].frames.length; i++) {
			frames[i] = this._anims[anim].frames[i] 
				+ this._anims[anim].df * direction;
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
		this._cur_direction = direction;
		this._cur_frame = frame_num;
		this._last_frame_update = this.age;
		//console.log("Chara: setAnim: " + this._cur_frame + " : " + frames.length);
	},
	getCurAnimTotalFrameNum: function() {
		return this._cur_anim.frames.length === null 
			? this._cur_anim.frames.length : 0;	
	},
	setCurAnimFrameNum: function(num) {
		if (this._cur_anim.frames.length == 1 && num > 1) {
			console.log("Error Chara.setCurAnimFrameNum: No other frame to set");
			return;
		}
		if (this._cur_anim.frames.length == num + 1 && this._cur_anim.loop === false) {
			return;
		}

		num = num % this._cur_anim.frames.length;
		this._cur_frame = num;
		this._last_frame_update = this.age;
		this.frame = this._cur_anim.frames[num] + this._cur_anim.df * this._cur_direction;
		//console.log("Chara: setCurAnimFrameNum: " + this._cur_frame + " : " + this.frame + " : " + this.age);
	},
	setCurAnimNextFrame: function() {
		//console.log("Chara: setCurAnimNextFrame: " + this._cur_frame + " : " + this.age);
		this.setCurAnimFrameNum(this._cur_frame + 1);
	},
	shouldPlayNextFrame: function() {
		//console.log("Chara: shouldPlayNextFrame: " + this._cur_frame + " : " + this.age);
		var next_frame = ~~((this.age % GAME.fps) 
			/ GAME.fps * this._cur_anim.fps);
		return next_frame == this._cur_frame ? true : false;
	},
}); 

var Battle = enchant.Class.create(enchant.Group, {
	classname: "Battle",
	initialize: function() {
		enchant.Group.call(this);
		this._status = CONSTS.getBattleStatus("INIT");
		this.round = 1;
		this.win_conds = [];
		this.lose_conds = [];
		this.scenario_conds = [];
		this._player_units = [];
		this._allies_units = [];
		this._enemy_units = [];
	
		// Big Status Machine
		this.addEventListener(enchant.Event.TOUCH_END, function(evt){
			//console.log("Battle clicked: " + evt.x + " : " + evt.y + " : " + this._status);
			if (this._status == CONSTS.getBattleStatus("PLAYER_TURN")) {
				var units = this.getUnits(evt.x, evt.y);
				// only map or exception
				if (units.length <= 1) {
					return;
				} else {
					for (var i = 0; i < units.length; i++) {
						if (units[i].classname === "Chara") {
							if (this.isPlayerUnit(units[i])) {
								this.playerUnitSelect(units[i]);
							} else if (this.isEnemyUnit(units[i])) {
								this.enemyUnitSelect(units[i]);
							} else if (this.isAlliesUnit(units[i])) {
								this.alliesUnitSelect(units[i]);
							}
							return;
						}
					}
				}
			}
			else if (this._status == CONSTS.getBattleStatus("PLAYER_UNIT_MENU")) {
				var units = this.getUnits(evt.x, evt.y);
				// only map or exception
				if (units.length <= 1) {
					this.removeMenu();
					this._status = CONSTS.getBattleStatus("PLAYER_TURN");
					return;
				}
			}
			// skip 
			else {
				console.log("Status: " + this._status + " can not handle this click, skip");
			}
		});
	},
	// status changes
	start: function() {
		this._status = CONSTS.getBattleStatus("PLAYER_TURN");
	},	
	sideChange: function() {
		this._status = CONSTS.getBattleStatus("ENEMY_TURN");
	},	
	nextTurn: function() {
		this._status = CONSTS.getBattleStatus("PLAYER_TURN");
	},
	win: function() {
		this._status = CONSTS.getBattleStatus("WIN");
	},
	lose: function() {
		this._status = CONSTS.getBattleStatus("LOSE");
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
	addPlayerUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			if (!units[i].hide) {
				this.addChild(new Chara(units[i]));
			}
			this._player_units.push(units[i]);
		}
	},
	addAlliesUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			if (!units[i].hide) {
				this.addChild(new Chara(units[i]));
			}
			this._allies_units.push(units[i]);
		}
	},
	addEnemyUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			if (!units[i].hide) {
				this.addChild(new Chara(units[i]));
			}
			this._enemy_units.push(units[i]);
		}
	},
	isPlayerUnit: function(unit) {
		for (var i = 0; i < this._player_units.length; i++) {
			if (this._player_units[i] === unit) {
				return true;
			}
		}
		return false;
	},
	isAlliesUnit: function(unit) {
		for (var i = 0; i < this._allies_units.length; i++) {
			if (this._allies_units[i] === unit) {
				return true;
			}
		}
		return false;
	},
	isEnemyUnit: function(unit) {
		for (var i = 0; i < this._enemy_units.length; i++) {
			if (this._enemy_units[i] === unit) {
				return true;
			}
		}
		return false;
	},

	// map utilities
	addMap: function(conf) {
		if (this._map) {
			this.reomveChild(this._map);
		}
		
		var map = new Map(conf.tileWidth, conf.tileHeight);
		map.image = GAME.assets[conf.image];
		if (conf.data.length > 0) {
			map.loadData(conf.data);
		} else {
			var matrix = [];
			for (var i = 0; i < conf.width; i++) {
				matrix[i] = [];
				for (var j = 0; j < conf.height; j++) {
					matrix[i][j] = i * conf.width + j;
				}
			}
			map.loadData(matrix);
		}
		if (conf.collisionData.length > 0) {
			map.collisionData = conf.collisionData;
		}

		this.addChild(map);
		this._map = map;
	},
	isMap: function(target) {
		return target === this._map ? true : false;
	},
	// BFS get available grids 
	// according to chara position and range
	_getAvailGrids: function(chara, rng) {
		var src = {
			x: chara.x,
			y: chara.y,
			r: rng,
			route: [],
		};
		var queue = [];
		var avail_grids = [];
		queue.push(src);
		while(queue.length > 0) {
			var cur = queue.shift();
			if (cur != src) {
				avail_grids.push(cur);
			}
			cur.route.push(cur);
			var up = {
				x: cur.x,
				y: cur.y - chara.height,
				r: cur.r - 1,
				route: cur.route,
			};
			var down = {
				x: cur.x,
				y: cur.y + chara.height,
				r: cur.r - 1,
				route: cur.route,
			};		
			var left = {
				x: cur.x - chara.width,
				y: cur.y,
				r: cur.r - 1,
				route: cur.route,
			};		
			var right = {
				x: cur.x + chara.width,
				y: cur.y,
				r: cur.r - 1,
				route: cur.route.push,
			};		
			if (!this._map.hitTest(down.x, down.y) && down.r > 0) {
				queue.push(down);
			}
			if (!this._map.hitTest(right.x, right.y) && right.r > 0) {
				queue.push(right);
			}
			if (!this._map.hitTest(up.x, up.y) && up.r > 0) {
				queue.push(up);
			}
			if (!this._map.hitTest(left.x, left.y) && left.r > 0) {
				queue.push(left);
			}
		}
		return avail_grids;
	},
	removeGrids: function() {
		if (this._move_grids) {
			for (var i = 0; i < this._move_grids; i++) {
				this.removeChild(this._move_grids[i]);
			}
		}
		if (this._atk_grids) {
			for (var i = 0; i < this._atk_grids; i++) {
				this.removeChild(this._atk_grids[i]);
			}
		}
	},
	showMoveRng: function(chara) {
		console.log("show move range");
		var self = this;
		this._move_grids = this._getAvailGrids(chara, chara.mov);
		this._atk_grids = this._getAvailGrids(chara, chara.rng);
		for (var i = 0; i < this._move_grids.length; i++) {
			var mov_shade = new Sprite(chara.width, chara.height);
			mov_shade.moveTo(this._move_grids[i].x, this._move_grids[i].y);
			mov_shade.image = GAME.assets["img/menu/blue.png"];
			mov_shade.addEventListener(enchant.Event.TOUCH_END, function(){
				self.removeGrids();
				self.move();
				self._status = CONSTS.getBattleStatus("PLAYER_UNIT_ACTION");
			});
		}
		for (var i = 0; i < this._atk_grids.length; i++) {
			var atk_shade = new Sprite(chara.width, chara.height);
			atk_shade.moveTo(this._move_grids[i].x, this._move_grids[i].y);
			atk_shade.image = GAME.assets["img/menu/Mark_12-1.png"]; 
			atk_shade.addEventListener(enchant.Event.TOUCH_END, function(){
				self.removeGrids();
				self.move();
				self._status = CONSTS.getBattleStatus("PLAYER_UNIT_ACTION");
			});
		}
	},
	showAtkRng: function(chara) {
		console.log("show attack range");
		var self = this;
		this._atk_grids = this._getAvailGrids(chara, chara.rng);
		for (var i = 0; i < this._atk_grids.length; i++) {
			var atk_shade = new Sprite(chara.width, chara.height);
			atk_shade.moveTo(this._move_grids[i].x, this._move_grids[i].y);
			atk_shade.image = GAME.assets["img/menu/blue.png"]; 
			atk_shade.addEventListener(enchant.Event.TOUCH_END, function(){
				self.removeGrids();
				self.attack();
				self._status = CONSTS.getBattleStatus("PLAYER_UNIT_ACTION");
			});
		}
	},

	attack: function(chara, enemy) {
		var result = this.calcAttack(chara, enemy);
		this.animCharaAttack(result);
	},

	// Menu
	showMenu: function(chara) {
		console.log("showMenu called");
		if (this._menu) {
			this.removeMenu();
		}
		var self = this;
		this._menu = new Group();
		// TODO: the coordinate and menu layout should be changed
		var atk_btn = new Sprite(32, 32);
		atk_btn.image = GAME.assets["img/menu/atk.png"] 
		atk_btn.moveBy(- 16 - 32, 0);
		atk_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.showAtkRng();
			self._status = CONSTS.getBattleStatus("PLAYER_UNIT_SHOW_RNG");
		});

		var mov_btn = new Sprite(32, 32);
		mov_btn.image = GAME.assets["img/menu/mov.png"];
		mov_btn.moveBy(16, 0);
		mov_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.showMoveRng();
			self._status = CONSTS.getBattleStatus("PLAYER_UNIT_SHOW_RNG");
		});

		this._menu.addChild(atk_btn);
		this._menu.addChild(mov_btn);

		this._menu.moveTo(~~(chara.x + chara.width / 2), ~~(chara.y - chara.height / 2));
		this.addChild(this._menu);
		this._status = CONSTS.getBattleStatus("PLAYER_UNIT_MENU");
	},
	removeMenu: function() {
		this.removeChild(this._menu);
	},
	isMenu: function(target) {
		return target === this._menu ? true : false;
	},

	// Animation utilities
	animCharaMove: function(chara, route) {
		// for each waypoint
		for (var i = 0; i < route.length; i++) {

		}
	},
	animCharaAttack: function(action_script) {
		// for each round
		for (var i = 0; i < action_script.length; i++) {
			
		}
	},
	animCharaAppear: function(chara) {

	},
	animCharaEscape: function(chara) {
		
	},
	animCharaDie: function(chara) {

	},
	
	// numberic calculations
	calcRoute: function(chara, target) {
	},
	calcAttack: function(attacker, defender) {
		var action_script = [];
		return action_script;
	},
	getUnits: function(x, y) {
		var units = [];
		for (var i = 0; i < this.childNodes.length; i++) {
			var node = this.childNodes[i];
			if (node.x <= x && x <= node.x + node.width
				&& node.y <= y && y <= node.y + node.height) {
				units.push(node);
			}
		}
		return units;
	},
	playerUnitSelect: function(unit) {
		if (unit.canMove()) {
			this.showMoveRng(unit);
			this.showMenu(unit);
		} else {
			console.log("This unit can not move!");
		}
	},
	alliesUnitSelect: function() {

	},
	enemyUnitSelect: function() {
		// only show InfoBox
	},
	_nop: function(){
	}
});

// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	CONSTS = new Consts();
	CONFIG = new Config();
	CONFIG.load(function(){
		GAME = new Core(CONFIG.getSystem.width, CONFIG.getSystem.height);
		GAME.fps = 60;

		GAME.preload(CONFIG.images());
		GAME.onload = function(){
			var battle = new Battle();
			
			battle.addMap(CONFIG.getMap());
			battle.addPlayerUnits(CONFIG.getPlayerUnits());
			battle.addAlliesUnits(CONFIG.getAlliesUnits());
			battle.addEnemyUnits(CONFIG.getEnemyUnits());

			GAME.rootScene.addChild(battle);
			
			battle.start();
		};
		GAME.start();
	});
};
