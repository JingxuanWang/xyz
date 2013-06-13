var BattleScene = enchant.Class.create(enchant.Scene, {
	classname: "BattleScene",
	initialize: function() {
		enchant.Scene.call(this);
		this._status = CONSTS.battleStatus("INIT");
		this.round = 1;
		this.win_conds = [];
		this.lose_conds = [];
		this.scenario_conds = [];
		this._units = [];
		this._player_units = [];
		this._allies_units = [];
		this._enemy_units = [];
		this._touch_origin_x = 0;
		this._touch_origin_y = 0;

		this.map_max_x = CONFIG.get(["map", "tileWidth"]) * CONFIG.get(["map", "width"]);
		this.map_max_y = CONFIG.get(["map", "tileHeight"]) * CONFIG.get(["map", "height"]);
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
		this.addUnits(CONFIG.get(["player_unit"]), "PLAYER");
		this.addUnits(CONFIG.get(["allies_unit"]), "ALIIES");
		this.addUnits(CONFIG.get(["enemy_unit"]), "ENEMY");

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
		if (this._status == CONSTS.battleStatus("PLAYER_TURN")) {
			unit = this.getUnit(evt.x, evt.y);
			// only map or exception
			if (unit != null) {
				if (this.isUnit(unit, "PLAYER")) {
					this.onUnitSelect(unit, "PLAYER");
				} else if (this.isUnit(unit, "ENEMY")) {
					this.onUnitSelect(unit, "ENEMY");
				}
			}
		}
		else if (this._status == CONSTS.battleStatus("PLAYER_UNIT_MENU")) {
			unit = this.getUnit(evt.x, evt.y);
			// only map or exception
			if (unit != null) {
				this.removeMenu();
				this._status = CONSTS.battleStatus("PLAYER_TURN");
			}
		}
		// skip 
		else {
			console.log("Status: " + this._status + " can not handle this click, skip");
		}
	},

	// status changes
	start: function() {
		this._status = CONSTS.battleStatus("PLAYER_TURN");
	},	
	sideChange: function() {
		this._status = CONSTS.battleStatus("ENEMY_TURN");
	},	
	nextTurn: function() {
		this._status = CONSTS.battleStatus("PLAYER_TURN");
	},
	win: function() {
		this._status = CONSTS.battleStatus("WIN");
	},
	lose: function() {
		this._status = CONSTS.battleStatus("LOSE");
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
			//var chara = new Chara(units[i]);
			var unit = new Unit(units[i]);
			if (!this._units[side]) {
				this._units[side] = [];
			}
			this._units[side].push(unit);
			if (!unit.hide) {
				this.unit_layer.addChild(unit);
			}
		}
	},
	isUnit: function(unit, side) {
		var units = this._units[side];
		if (units == null) {
			return false;
		}
		for (var i = 0; i < units.length; i++) {
			if (units[i] === unit) {
				return true;
			}
		}
		return false;
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
	},
	isMap: function(target) {
		return target === this.map;
	},
	removeShades: function() {
		this.effect_layer.removeChild(this._atk_shade);
		this.effect_layer.removeChild(this._mov_shade);
		this._atk_shade = null;
		this._mov_shade = null;
	},
	showMoveRng: function(unit, bind_callback) {
		console.log("show move range");
		var self = this;
		var i = 0;
		var shade;
		this._move_grids = this.map.getAvailGrids(unit, unit.cur_attr.mov, "MOV");
		this._atk_grids = this.map.getAvailAtkGrids(unit, unit.cur_attr.rng);
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
		console.log("show attack range" + this._atk_grids);
		var self = this;
		this._atk_grids = this.map.getAvailAtkGrids(unit, unit.cur_attr.rng);
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
		console.log("move " + shade.x + " : " + shade.y);
		var route = shade.route;
		if (route) {
			unit.animMove(route, bind(this.showMenu, this));
			this._status = CONSTS.battleStatus("PLAYER_TURN");
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
			return;
		}
		var result = this.calcAttack(unit, enemy);
		this.animCharaAttack(result);
		this._status = CONSTS.battleStatus("PLAYER_TURN");
	},

	// Menu
	showMenu: function(unit) {
		console.log("showMenu called");
		if (this._menu) {
			this.removeMenu();
		}
		var self = this;
		this._menu = new Group();
		// TODO: the coordinate and menu layout should be changed
		var atk_btn = new Sprite(33, 32);
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
			self.showMoveRng(unit);
		});

		this._menu.addChild(atk_btn);
		this._menu.addChild(mov_btn);

		this._menu.moveTo(~~(unit.x + unit.width / 4), ~~(unit.y - unit.height / 2));
		this.ui_layer.addChild(this._menu);
		this._status = CONSTS.battleStatus("PLAYER_UNIT_MENU");
	},
	removeMenu: function() {
		this.ui_layer.removeChild(this._menu);
	},
	isMenu: function(target) {
		return target === this._menu;
	},

	// infobox
	showInfoBox: function(unit, side) {
		this.infobox = new InfoBox(unit);
		this.ui_layer.addChild(this.infobox);
	},
	removeInfoBox: function(unit, side) {
		if (this.infobox != null) {
			this.ui_layer.removeChild(this.infobox);
		}	
	},
	isInfoBox: function(target) {
		return target === this.infobox;
	},

	// Animation utilities
	animCharaAttack: function(action_script) {
		if (action_script == null) {
			console.log("empty action_script");
			return;
		}
		// for each round
		for (var i = 0; i < action_script.length; i++) {
			var attacker = action_script[i].a;
			var defender = action_script[i].d;
			var damage = action_script[i].ad;
			var type = action_script[i].t; 
			var exp = action_script[i].ae;
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
					
				atl = atl.delay(30).then(function() {
					attacker.resume();
					defender.resume();
				});
			}
			// show defender infobox
			// show attacker infobox
		}
	},
	animCharaAppear: function(unit) {

	},
	animCharaEscape: function(unit) {
		
	},
	animCharaDie: function(unit) {

	},
	
	// numberic calculations
	calcRoute: function(unit, target) {
		var judgeDirection = function(src, dst) {
			if (src.x == dst.x && src.y > dst.y) {
				return CONSTS.direction("DOWN");
			}
			if (src.x == dst.x && src.y < dst.y) {
				return CONSTS.direction("UP");
			}
			if (src.x < dst.x && src.y == dst.y) {
				return CONSTS.direction("RIGHT");
			}
			if (src.x > dst.x && src.y == dst.y) {
				return CONSTS.direction("LEFT");
			}
		}
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
		var action_script = [];
		// attack
		var atk_dmg = this.calcAtkDamage(attacker, defender, "ATTACK");
		var atk_exp = this.calcExp(attacker, defender, atk_dmg);
		action_script.push({
			t: "ATTACK",
			a: attacker,
			d: defender,
			ad: atk_dmg,
			ae: atk_exp
		})
		// 可以封杀反击...
		if (false) {
			// retaliate
			atk_dmg = this.calcAtkDamage(defender, attacker, "RETALIATE");
			atk_exp = this.calcExp(attacker, defender, atk_dmg);
			action_script.push({
				t: "RETALIATE",
				a: defender,
				d: attacker,
				rd: atk_dmg,
				re: atk_exp
			});
		}
		return action_script;
	},
	calcDirection: function(attacker, defender) {
		if (defender.x > attacker.x) {
			return CONSTS.direction("RIGHT");
		} else if (defender.x < attacker.x) {
			return CONSTS.direction("LEFT");
		} else {
			if (defender.y < attacker.y) {
				return CONSTS.direction("UP");
			} else {
				return CONSTS.direction("DOWN");
			}
		}
	},
	calcAtkDamage: function(attacker, defender) {
		return 50;
	},
	calcExp: function(attacker, defender, damage) {
		return 10;
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
		if (unit != null && this.isUnit(unit, side)) {
			return true;
		}
		return false;
	}, 

	onUnitSelect: function(unit, side) {
		if (side == "PLAYER") {
			if (unit.canMove()) {
				this.showMoveRng(unit, false);
			} else {
				console.log("This unit can not move!");
			}
		} else if (side == "ENEMY") {
			this.showInfoBox(unit, side);
		}
	},
	_nop: function(){
	}
});

