var Battle = enchant.Class.create(enchant.Group, {
	classname: "Battle",
	initialize: function() {
		enchant.Group.call(this);
		this._status = CONSTS.battleStatus("INIT");
		this.round = 1;
		this.win_conds = [];
		this.lose_conds = [];
		this.scenario_conds = [];
		this._units = [];
		this._player_units = [];
		this._allies_units = [];
		this._enemy_units = [];
	
		// Big Status Machine
		this.addEventListener(enchant.Event.TOUCH_END, function(evt){
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
	addUnits: function(units, side) {
		for (var i = 0; i < units.length; i++) {
			var chara = new Chara(units[i]);
			if (!this._units[side]) {
				this._units[side] = [];
			}
			this._units[side].push(chara);
			if (!chara.hide) {
				this.addChild(chara);
			}
		}
	},
	isUnit: function(unit, side) {
		var units = this._units[side];
		if (units === null) {
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
			x: ~~(chara.x),
			y: ~~(chara.y),
			r: rng,
			route: [],
		};
		var queue = [];
		var avail_grids = [];
		var self = this;

		var isValid = function (cur) {
			// TODO: this may be changed according to map settsings	
			if (cur.x < 0 || cur.y < 0 || 
				cur.x > CONFIG.get(["system", "width"]) || 
				cur.y > CONFIG.get(["system", "height"])) {
				return false;
			}
			if (cur.x == src.x && cur.y == src.y) {
				return false;
			}
			if (cur.r < 0) {
				return false;
			}
			if (self.hitUnit(cur.x, cur.y, "ENEMY")) {
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
				y: ~~(cur.y - chara.height),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("UP"),
				route: cur.route.slice(),
			};
			var down = {
				x: ~~(cur.x),
				y: ~~(cur.y + chara.height),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("DOWN"),
				route: cur.route.slice(),
			};		
			var left = {
				x: ~~(cur.x - chara.width),
				y: ~~(cur.y),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("LEFT"),
				route: cur.route.slice(),
			};		
			var right = {
				x: ~~(cur.x + chara.width),
				y: ~~(cur.y),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("RIGHT"),
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
	removeShades: function() {
		this.removeChild(this._atk_shade);
		this.removeChild(this._mov_shade);
		this._atk_shade = null;
		this._mov_shade = null;
	},
	showMoveRng: function(chara, bind_callback) {
		console.log("show move range");
		var self = this;
		var i = 0;
		var shade;
		this._move_grids = this._getAvailGrids(chara, chara.curAttr.mov);
		this._atk_grids = this._getAvailGrids(chara, chara.curAttr.rng);
		this._atk_shade = new Group();
		this._mov_shade = new Group();
	
		// TODO: this should be rewritten
		var move_shade_cb = function(grid) {
			self.removeShades();
			self.move(chara, grid);
		};

		for (i = 0; i < this._move_grids.length; i++) {
			shade = new MoveShade(
				this._move_grids[i],
				chara.width,
				chara.height,
				move_shade_cb
			);
			this._atk_shade.addChild(shade);
		}
		this.addChild(this._atk_shade);
		
		var atk_shade_cb = function(grid) {
			self.removeShades();
			self.move(chara, grid);
		};

		for (i = 0; i < this._atk_grids.length; i++) {
			shade = new AttackShade(
				this._atk_grids[i],
				chara.width,
				chara.height,
				atk_shade_cb
			);
			this._mov_shade.addChild(shade);
		}
		this.addChild(this._mov_shade);
	},
	showAtkRng: function(chara) {
		console.log("show attack range" + this._atk_grids);
		var self = this;
		this._atk_grids = this._getAvailGrids(chara, chara.curAttr.rng);
		var atk_shade_cb = function() {
			self.removeShades();
			self.attack(chara, shade.x, shade.y);
		};
		this._atk_shade = new Group();
		for (var i = 0; i < this._atk_grids.length; i++) {
			var shade = new AttackShade(
				this._atk_grids[i],
				chara.width,
				chara.height,
				atk_shade_cb
			);
			this._atk_shade.addChild(shade);
		}
		this.addChild(this._atk_shade);
	},
	move: function(chara, shade) {
		console.log("move " + shade.x + " : " + shade.y);
		//var route = this.calcRoute(chara, shade);
		var route = shade.route;
		if (route) {
			this.animCharaMove(chara, route);
			this._status = CONSTS.battleStatus("PLAYER_TURN");
		}
	},
	attack: function(chara, x, y) {
		var enemy = this.getChara(x, y);
		var result = this.calcAttack(chara, enemy);
		this.animCharaAttack(result);
		this._status = CONSTS.battleStatus("PLAYER_TURN");
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
			self.removeShades();
			self.showAtkRng(chara);
		});

		var mov_btn = new Sprite(32, 32);
		mov_btn.image = GAME.assets["img/menu/mov.png"];
		mov_btn.moveBy(16, 0);
		mov_btn.addEventListener(enchant.Event.TOUCH_END, function(){
			self.removeMenu();
			self.removeShades();
			self.showMoveRng(chara);
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
		var tl = chara.tl;
		var d = chara._cur_direction;
		var c = 0;
		for (var i = 0; i < route.length; i++) {
			var d = route[i].d;
			// 后边d值变化了，覆盖了前面的值
			// 导致之前放入回调函数里的d值也变化了
			tl = tl.action({
				time: 0,
				onactionstart: function() {
					console.log("onactinostart :" + d + " : " + route[c].d);
					chara.setAnim("MOVE", route[c].d);
					++c;
				},
			}).moveTo(route[i].x, route[i].y, 20);
		}
		var self = this;
		tl = tl.then(function() {
			chara.moveTo(Math.round(chara.x), Math.round(chara.y));
		});
		tl = tl.then(function() {
			self.showMenu(chara);
		});
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
			x: chara.x,
			y: chara.y
		};
		// return animation script	
		while (target.length > 0) {
			var next = target.shift();
			var d = judgeDirection(cur, next);
			chara.setAnim
		}
	},
	calcAttack: function(attacker, defender) {
		var action_script = [];
		return action_script;
	},
	getChara: function(x, y) {

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
		for (var i = 0; i < this.childNodes.length; i++) {
			var node = this.childNodes[i];
			if (node.x <= x && x < node.x + node.width && 
				node.y <= y && y < node.y + node.height && 
				node.classname === "Chara") {
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
		}
	},
	_nop: function(){
	}
});

