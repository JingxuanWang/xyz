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

