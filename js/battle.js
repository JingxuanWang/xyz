var Battle = enchant.Class.create(enchant.Group, {
	classname: "Battle",
	initialize: function() {
		enchant.Group.call(this);
		this._status = CONSTS.battleStatus("INIT");
		this.round = 1;
		this.win_conds = [];
		this.lose_conds = [];
		this.scenario_conds = [];
		this._player_units = [];
		this._allies_units = [];
		this._enemy_units = [];
		this._shades = [];
	
		// Big Status Machine
		this.addEventListener(enchant.Event.TOUCH_END, function(evt){
			//console.log("Battle clicked: " + evt.x + " : " + evt.y + " : " + this._status);
			var units = [];
			if (this._status == CONSTS.battleStatus("PLAYER_TURN")) {
				units = this.getUnits(evt.x, evt.y);
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
			else if (this._status == CONSTS.battleStatus("PLAYER_UNIT_MENU")) {
				units = this.getUnits(evt.x, evt.y);
				// only map or exception
				if (units.length <= 1) {
					this.removeMenu();
					this._status = CONSTS.battleStatus("PLAYER_TURN");
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
	addPlayerUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			var chara = new Chara(units[i]);
			this._player_units.push(chara);
			if (!chara.hide) {
				this.addChild(chara);
			}
		}
	},
	addAlliesUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			var chara = new Chara(units[i]);
			this._allies_units.push(chara);
			if (!chara.hide) {
				this.addChild(chara);
			}
		}
	},
	addEnemyUnits: function(units) {
		for (var i = 0; i < units.length; i++) {
			var chara = new Chara(units[i]);
			this._enemy_units.push(chara);
			if (!chara.hide) {
				this.addChild(chara);
			}
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
			cur.route.push({x: cur.x, y: cur.y});
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
				route: cur.route,
			};		
			if (!this._map.hitTest(down.x, down.y) && down.r >= 0) {
				queue.push(down);
			}
			if (!this._map.hitTest(right.x, right.y) && right.r >= 0) {
				queue.push(right);
			}
			if (!this._map.hitTest(up.x, up.y) && up.r >= 0) {
				queue.push(up);
			}
			if (!this._map.hitTest(left.x, left.y) && left.r >= 0) {
				queue.push(left);
			}
		}
		return avail_grids;
	},
	removeGrids: function() {
		var i = 0;
		if (this._move_grids) {
			for (i = 0; i < this._move_grids; i++) {
				this.removeChild(this._move_grids[i]);
			}
		}
		if (this._atk_grids) {
			for (i = 0; i < this._atk_grids; i++) {
				this.removeChild(this._atk_grids[i]);
			}
		}
	},
	showMoveRng: function(chara) {
		console.log("show move range");
		var self = this;
		var i = 0;
		var shade;
		this._move_grids = this._getAvailGrids(chara, chara.mov);
		this._atk_grids = this._getAvailGrids(chara, chara.rng);
	
		var move_shade_cb = function() {
			self.removeGrids();
			self.move();
			self._status = CONSTS.battleStatus("PLAYER_UNIT_ACTION");
		};

		for (i = 0; i < this._move_grids.length; i++) {
			shade = new MoveShade(
				this._move_grids[i].x,
				this._move_grids[i].y,
				chara.width,
				chara.height,
				move_shade_cb
			);
			this._shades.push(shade);
			this.addChild(shade);
		}
		var atk_shade_cb = function() {
			self.removeGrids();
			self.move();
			self._status = CONSTS.battleStatus("PLAYER_UNIT_ACTION");
		};

		for (i = 0; i < this._atk_grids.length; i++) {
			shade = new AttackShade(
				this._atk_grids[i].x,
				this._atk_grids[i].y,
				chara.width,
				chara.height,
				atk_shade_cb
			);
			this._shades.push(shade);
			this.addChild(shade);
		}
	},
	showAtkRng: function(chara) {
		var self = this;
		this._atk_grids = this._getAvailGrids(chara, chara.curAttr.rng);
		console.log("show attack range" + this._atk_grids);
		var atk_shade_cb = function() {
			self.removeGrids();
			self.attack(chara, shade.x, shade.y);
			self._status = CONSTS.battleStatus("PLAYER_UNIT_ACTION");
		};
		for (var i = 0; i < this._atk_grids.length; i++) {
			var shade = new AttackShade(
				this._atk_grids[i].x,
				this._atk_grids[i].y,
				chara.width,
				chara.height,
				atk_shade_cb
			);
			this._shades.push(shade);
			this.addChild(shade);
		}
	},

	attack: function(chara, x, y) {
		var enemy = this.getChara(x, y);
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
		var atk_btn = new Sprite(33, 32);
		atk_btn.image = GAME.assets["img/menu/atk.png"]; 
		atk_btn.moveBy(- 16 - 32, 0);
		atk_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.showAtkRng(chara);
			self._status = CONSTS.battleStatus("PLAYER_UNIT_SHOW_RNG");
		});

		var mov_btn = new Sprite(32, 32);
		mov_btn.image = GAME.assets["img/menu/mov.png"];
		mov_btn.moveBy(16, 0);
		mov_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.showMoveRng(chara);
			self._status = CONSTS.battleStatus("PLAYER_UNIT_SHOW_RNG");
		});

		this._menu.addChild(atk_btn);
		this._menu.addChild(mov_btn);

		this._menu.moveTo(~~(chara.x + chara.width / 4), ~~(chara.y - chara.height / 2));
		this.addChild(this._menu);
		this._status = CONSTS.battleStatus("PLAYER_UNIT_MENU");
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
	getChara: function(x, y) {

	},
	getUnits: function(x, y) {
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

