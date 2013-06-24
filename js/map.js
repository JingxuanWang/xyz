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
	// convert global coordinate to index
	x2i: function(x) {
		return Math.floor((x - this.x) / this.tileWidth);
	},
	y2j: function(y) {
		return Math.floor((y - this.y) / this.tileHeight);
	},
	// convert index to local coordinate
	// where map.x map.y is always 0
	i2x: function(i) {
		return i * this.tileWidth;
	},
	j2y: function(j) {
		return j * this.tileHeight;
	},
	getTerrain: function(i, j) {
		return this.terrain_data[i][j];
	},
	getTerrainName: function(x, y) {
		return "平地";
	},
	getTerrainInfo: function(x, y) {
		return 100;
	},
	isInMap: function(i, j) {
		if (j >= 0 && j <= this.height &&
			i >= 0 && i <= this.width) {
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
			i: unit.i,
			j: unit.j,
			r: rng,
			route: [],
		};
		var queue = [];
		var avail_grids = [];
		var self = this;

		// function within getAvailGrids
		// it can 'see' variables defined in getAvailGrids
		var isValid = function (cur) {
			if (!self.isInMap(cur.i, cur.j)) {
				return false;
			}
			if (cur.i == src.i && cur.j == src.j) {
				return false;
			}
			if (cur.r < 0) {
				return false;
			}
			var terrain = self.getTerrain(cur.i, cur.j);
			// impassible
			if (type == "MOV" && !self.isPassible(terrain, unit.attr.current.school)) {
				return false;
			}
			// remain movement > 0
			// but movement is not enough for this grid
			if (cur.r + 1 < self.getReqMovement(terrain, unit.attr.current.school)) {
				return false;
			}
			if (type == "MOV" && BATTLE.hitUnit(cur.i, cur.j, CONSTS.side.ENEMY)) {
				return false;
			}

			for (var i = 0; i < avail_grids.length; i++) {
				if (avail_grids[i].i == cur.i && avail_grids[i].j == cur.j) {
					return false;
				}
			}
			return true;
		};

		queue.push(src);
		while(queue.length > 0) {
			var cur = queue.shift();
			if (isValid(cur)) {
				cur.route.push({i: ~~(cur.i), j: ~~(cur.j), d: cur.d});
				avail_grids.push(cur);
			}
			var up = {
				i: cur.i,
				j: cur.j - 1,
				r: ~~(cur.r - 1),
				d: CONSTS.direction.UP,
				route: cur.route.slice(),
			};
			var down = {
				i: cur.i,
				j: cur.j + 1,
				r: ~~(cur.r - 1),
				d: CONSTS.direction.DOWN,
				route: cur.route.slice(),
			};		
			var left = {
				i: cur.i - 1,
				j: cur.j,
				r: ~~(cur.r - 1),
				d: CONSTS.direction.LEFT,
				route: cur.route.slice(),
			};		
			var right = {
				i: cur.i + 1,
				j: cur.j,
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

