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
		var origin = {
			i: ~~(this.unit.i),
			j: ~~(this.unit.j),
			r: ~~(this.unit.mov),
			d: ~~(this.unit.d),
			route: [],
		};
		var action = {};
		this.possible_actions.push(this.genIdle(origin));			
		// Strategy that dont't allow moving
		if (this.type == CONSTS.ai.DUMMY) {
			// do nothing
		} 
		else if (this.type == CONSTS.ai.HOLD_POSITION) {
			this.possible_actions.concat(this.genAttack(origin));
			this.possible_actions.concat(this.genMagicAttack(origin));
			this.possible_actions.concat(this.genHeal(origin));
		}
		// Strategy that allow moving 
		else {
			var grids = MAP.getAvailGrids(this.unit, this.unit.attr.mov, "MOV");
			for (var i = 0; i < grids.length; i++) {
				var g = grids[i];
				this.possible_actions.push(this.genIdle(g));
				this.possible_actions.concat(this.genAttack(g));
				this.possible_actions.concat(this.genMagicAttack(g));
				this.possible_actions.concat(this.genHeal(g));
			}
		}
	},
	genIdle: function(grid) {
		var action = {};
		action.type = "";
		action.move = grid;
		action.score = this.scoreMove(action.move);
		return action;
	},
	genAttack: function(grid) {
		var actions = [];

		this.unit.i = grid.i;
		this.unit.j = grid.j;

		var grids = MAP.getAvailAtkGrids(this.unit, this.unit.current.rng);

		for (var j = 0; j < grids.length; j++) {
			var unit = BATTLE.getUnitByIndex(
				grids[j].i, grids[j].j, CONSTS.side.PLAYER
			);
			if (unit !== null && unit.isOnBattleField()) {
				var action = {};
				action.type = "ATTACK";
				action.move = grid;
				action.target = unit;
				action.presult = this.predictAttack(unit);
				// score
				action.score += this.scoreMove(action.move);
				action.score += this.scoreAttack(action.presult);

				actions.push(action);
			}
		}
		return actions;
	},
	genMagicAttack: function() {
	},
	genHeal: function() {
	},

	predictAttack: function(unit) {
		var attacker = this.unit;
		var defender = unit;
		var atk_dmg = this.calcAtkDamage(attacker, defender, "ATTACK");
		var rtl_dmg = this.calcAtkDamage(defender, attacker, "RETALIATE");
		var presult = {
			attacker: {
				damage: rtl_dmg,
				status: attacker._status,
			},
			defender: {
				damage: atk_dmg,
				status: defender._status,
			}
		};
		if (attacker.attr.current.hp - rtl_dmg <= 0) {
			presult.defender.status = CONSTS.unit_status.DEAD;
		}
		if (defender.attr.current.hp - atk_dmg <= 0) {
			presult.defender.status = CONSTS.unit_status.DEAD;
		}

		return presult;
	},
	predictMagicAttack: function() {
	},
	predictHeal: function() {
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
			if (presult.defender.status == CONSTS.unit_status.DEAD) {
				score += CONSTS.INFINITE;
			}
		}
		if (presult.attacker) {
			score -= Math.round(presult.attacker.damage / 2);
			if (presult.attacker.status == CONSTS.unit_status.DEAD) {
				score -= CONSTS.INFINITE;
			}
		}
		// maybe useful in the future
		if (presult.other) {

		}
		return score;
	},
	// 3, sort all actions according to score
	// 4, fetch randomly one action above the line
	determineAction: function() {
		this.getAvailActions();
		sortByProp(this.possible_actions, "score", -1);
		this.possible_actions.filter(this.isAboveLine);
		var index = rand(0, this.possible_actions.length - 1);
		return this.possible_actions[index];
	},
	isAboveLine: function(action) {
		return true;
	},
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

