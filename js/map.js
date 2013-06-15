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
		for (var t in CONSTS._terrains) {
			if (this.isPassible(CONSTS._terrains[t])) {
				this._movement_matrix[CONSTS._terrains[t]] = [];
				for (var s in CONSTS._schools) {
					// TODO: this should be changed later
					this._movement_matrix[CONSTS._terrains[t]][CONSTS._schools[s]] = 1;
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
			if (type == "MOV" && !self.isPassible(terrain, unit.cur_attr.school)) {
				return false;
			}
			// remain movement > 0
			// but movement is not enough for this grid
			if (cur.r + 1 < self.getReqMovement(terrain, unit.cur_attr.school)) {
				return false;
			}
			if (type == "MOV" && BATTLE.hitUnit(cur.x, cur.y, "ENEMY")) {
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
				d: CONSTS.direction("UP"),
				route: cur.route.slice(),
			};
			var down = {
				x: ~~(cur.x),
				y: ~~(cur.y + unit.height),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("DOWN"),
				route: cur.route.slice(),
			};		
			var left = {
				x: ~~(cur.x - unit.width),
				y: ~~(cur.y),
				r: ~~(cur.r - 1),
				d: CONSTS.direction("LEFT"),
				route: cur.route.slice(),
			};		
			var right = {
				x: ~~(cur.x + unit.width),
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
	getAvailAtkGrids: function(unit, type) {
		if (type === CONSTS.attack_type("NONE")) {
			return [];
		}
		else if (type <= CONSTS.attack_type("RANGE_5")) {
			return this.getAvailGrids(unit, type, "ATK");			
		}
	},

	_noop: function() {}
});

