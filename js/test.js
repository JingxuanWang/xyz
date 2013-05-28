enchant();

var GAME;
var DOWN = 0;
var RIGHT = 1;
var UP = 2;
var LEFT = 3;
var SPEED = 2;
var UNIT_STATUS = {
	// common status
	NORMAL: 0,
	MOVED: 1,
	ACTIONED: 2,
	// extra
	POISON: 11,
		

	// dead
	DEAD: -1,
};
var	BATTLE_STATUS = {
	INIT: 0,
	SCENARIO: 1,
	PLAYER_TURN: 100,
	PLAYER_UNIT_MENU: 101,
	PLAYER_UNIT_SHOW_RNG: 102,
	PLAYER_UNIT_ACTION: 103,
	ENEMY_TURN: 200,
	ENEMY_UNIT_ACTION: 201
};

var Attr = enchant.Class.create({
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
	initialize: function(x, y, attr) {
		enchant.Sprite.call(this, x, y);
		this.x = x;
		this.y = y;
		this._status = UNIT_STATUS["NORMAL"];
		//this.image = game.assets['chara1.png'];
		//this.frame = 5;
		// TODO: to read these by config
		this._anims = {
			"ATTACK" : {
				"asset" : "img/unit/Unit_atk_" + attr.chara_id + ".png",
				"frames" : [0, 0, 0, 0, 0, 1, 2, 3],
				// df stand for direction factor
				"df" : 4,
				"fps" : 12,
				"loop" : false,
				"width" : 64,
				"height" : 64
			},
			"MOVE" : {
				"asset" : "img/unit/Unit_mov_" + attr.chara_id + ".png",
				"frames" : [0, 1],
				"df" : 2,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"WEAK" : {
				"asset" : "img/unit/Unit_mov_" + attr.chara_id + ".png",
				"frames" : [6, 7],
				"df" : 0,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"STAND" : {
				"asset" : "img/unit/Unit_spec_" + attr.chara_id + ".png",
				"frames" : [0],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"DEFEND" : {
				"asset" : "img/unit/Unit_spec_" + attr.chara_id + ".png",
				"frames" : [4],
				"df" : 1,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"HURT" : {
				"asset" : "img/unit/Unit_spec_" + attr.chara_id + ".png",
				"frames" : [8],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"WIN" : {
				"asset" : "img/unit/Unit_spec_" + attr.chara_id + ".png",
				"frames" : [9],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			}
		};

		this.setAnim("MOVE", LEFT);
		//this.setAnim("ATTACK", RIGHT);
		
		this.addEventListener("enterframe", function(){
			if (this.shouldPlayNextFrame()) {
				this.setCurAnimNextFrame();
			}
		});
		this.attr = new Attr(attr);
		// init animations
	},
	isPlayerUnit: function() {
		return true;
		// TODO: this should be changed
		if (this.attr.chara_id > 100) {
			return true;
		} else {
			return false;
		}
	},
	setStatus: function(st) {
		if (UNIT_STATUS[st] === null) {
			console.log("Chara: setStatus undefined status: " + st);
		}
		this._status = UNIT_STATUS[st];
	},
	canMove: function() {
		if (this._status != UNIT_STATUS["MOVED"]
		&& this._status != UNIT_STATUS["ACTIONED"]
		&& this._status != UNIT_STATUS["DEAD"]) {
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
		this._status = BATTLE_STATUS["INIT"];
		this.round = 1;
		this.win_conds = [];
		this.lose_conds = [];
		this.scenario_conds = [];
	
		// Big Status Machine
		this.addEventListener(enchant.Event.TOUCH_END, function(evt){
			//console.log("Battle clicked: " + evt.x + " : " + evt.y + " : " + this._status);
			if (this._status == BATTLE_STATUS["PLAYER_TURN"]) {
				var units = this.getUnits(evt.x, evt.y);
				// only map or exception
				if (units.length <= 1) {
					return;
				} else {
					for (var i = 0; i < units.length; i++) {
						if (units[i].classname === "Chara") {
							if (units[i].isPlayerUnit()) {
								this.unitSelect(units[i]);
							} else {
								this.enemyUnitSelect(units[i]);
							}
							return;
						}
					}
				}
			}
			else if (this._status == BATTLE_STATUS["PLAYER_UNIT_MENU"]) {
				var units = this.getUnits(evt.x, evt.y);
				// only map or exception
				if (units.length <= 1) {
					this.removeMenu();
					this._status = BATTLE_STATUS["PLAYER_TURN"];
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
		this._status = BATTLE_STATUS["PLAYER_TURN"];
	},	
	sideChange: function() {
		this._status = BATTLE_STATUS["ENEMY_TURN"];
	},	
	nextTurn: function() {
		this._status = BATTLE_STATUS["PLAYER_TURN"];
	},
	win: function() {
		this._status = BATTLE_STATUS["WIN"];
	},
	lose: function() {
		this._status = BATTLE_STATUS["LOSE"];
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


	// map utilities
	addMap: function(map) {
		if (this._map) {
			this.reomveChild(this._map);
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
				self._status = BATTLE_STATUS["PLAYER_UNIT_ACTION"];
			});
		}
		for (var i = 0; i < this._atk_grids.length; i++) {
			var atk_shade = new Sprite(chara.width, chara.height);
			atk_shade.moveTo(this._move_grids[i].x, this._move_grids[i].y);
			atk_shade.image = GAME.assets["img/menu/Mark_12-1.png"]; 
			atk_shade.addEventListener(enchant.Event.TOUCH_END, function(){
				self.removeGrids();
				self.move();
				self._status = BATTLE_STATUS["PLAYER_UNIT_ACTION"];
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
				self._status = BATTLE_STATUS["PLAYER_UNIT_ACTION"];
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
			self._status = BATTLE_STATUS["PLAYER_UNIT_SHOW_RNG"];
		});

		var mov_btn = new Sprite(32, 32);
		mov_btn.image = GAME.assets["img/menu/mov.png"];
		mov_btn.moveBy(16, 0);
		mov_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.showMoveRng();
			self._status = BATTLE_STATUS["PLAYER_UNIT_SHOW_RNG"];
		});

		this._menu.addChild(atk_btn);
		this._menu.addChild(mov_btn);

		this._menu.moveTo(~~(chara.x + chara.width / 2), ~~(chara.y - chara.height / 2));
		this.addChild(this._menu);
		this._status = BATTLE_STATUS["PLAYER_UNIT_MENU"];
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
		for (var i = 0; i < rouht.length; i++) {

		}
	},
	animCharaAttack: function(action_script) {
		// for each round
		for (var i = 0; i < action_script.length; i++) {
			
		}
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
	unitSelect: function(unit) {
		if (unit.canMove()) {
			this.showMoveRng(unit);
			this.showMenu(unit);
		} else {
			console.log("This unit can not move!");
		}
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
    var game = new Core(480, 480);
    game.fps = 60;
	// TODO: Don't use image file name directly
	// bind thess with variables.
	// For example:
	//  config.map = "img/map/HM_1.png"
    game.preload([
		"img/menu/Mark_12-1.png",
		"img/menu/blue.png",
		"img/map/HM_1.png", 
		"img/menu/atk.png", 
		"img/menu/mov.png", 
		"img/unit/Unit_mov_109.png",
		"img/unit/Unit_atk_109.png",
		"img/unit/Unit_spc_109.png",
		"img/unit/Unit_mov_3.png",
		"img/unit/Unit_atk_3.png",
		"img/unit/Unit_spc_3.png"
	]);
	GAME = game;

    game.onload = function(){
		/*
		var hero = new Sprite(48, 48);
		hero.image = game.assets["img/unit/Unit_mov_109.png"];
		
		hero.x = 0;
		hero.y = 100;
		hero.frame = 2;
		*/
		var hero = new Chara(240, 240, {chara_id: 109});
		var enemy = new Chara(200, 200, {chara_id: 3});
		
		//var map = new Sprite(480, 480);
		var map = new Map(48, 48);
		map.image = game.assets["img/map/HM_1.png"];
		map.loadData([
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		]);
		var scene = new Battle();
		
		scene.addMap(map);
		scene.addChild(hero);
		scene.addChild(enemy);

        game.rootScene.addChild(scene);


// Animation
		scene.tl.action({
			time: 60,
			// action start
			onactionstart: function(evt){
				hero.setAnim("ATTACK", LEFT);
			}, 
			// action tick
			onactiontick: function(evt){
		
			}, 
			// action end
			onactionend: function(evt){
				hero.setAnim("MOVE", LEFT);
				scene.start();
			},
		});
    };
    game.start();
};
