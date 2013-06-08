var Consts = enchant.Class.create({
	classname: "Consts",
	initialize: function() {
		this._directions = {
			DOWN: 0,
			RIGHT: 1,
			UP: 2,
			LEFT: 3,
		};
		this._side = {
			PLAYER: 0,
			ALLIES: 1,
			ENEMY: 2,
			ENEMY_ALLIES: 3,
			NUTRUAL: 4,
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
		this._atk_types = {
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
	},
	side: function(s) {
		return this._side[s];
	},
	direction: function(d) {
		return this._directions[d];
	},	
	unitStatus: function(st) {	
		return this._unit_status[st];
	},	
	battleStatus: function(st) {
		return this._battle_status[st];
	},	
	attack_type: function(type) {
		return this._atk_types[type];
	},

	_noop: function(){}
});
