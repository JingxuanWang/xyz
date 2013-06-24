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
		return score
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
	}
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

