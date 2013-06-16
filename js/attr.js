var Attr = enchant.Class.create({
	classname: "Attr",
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
	exp: 0,
	
	initialize: function(master_attr, cur_attr) {
		if (master_attr == null) {
			throw new Error('master_attr undefined');	
		}
		this.master = {};
		this.current = {};
		this.last = {};

		this.master.chara_id = master_attr.chara_id;
		this.master.name = master_attr.name;
		this.master.level = master_attr.level;
		this.master.school = master_attr.school;
		this.master.rank = master_attr.rank;
		this.master.hp = master_attr.hp;
		this.master.mp = master_attr.mp;
		this.master.atk = master_attr.atk;
		this.master.def = master_attr.def;
		this.master.intl = master_attr.intl;
		this.master.dex = master_attr.dex;
		this.master.mor = master_attr.mor;
		this.master.mov = master_attr.mov;
		this.master.rng = master_attr.rng;
		this.master.exp = master_attr.exp;

		// init current & last
		for (var prop in this.master) {
			var value = cur_attr && cur_attr[prop] ? cur_attr[prop] : this.master[prop];
			this.current[prop] = value;
			this.last[prop] = value;
		}
	},
	master: {
		get: function() {
			return this._master;
		},
		set: function(m) {
			this._master = m;
		}
	},
	current: {
		get: function() {
			return this._current;
		},
		set: function(c) {
			this._current = c;
		}
	},
	last: {
		get: function() {
			return this._last;
		},
		set: function(l) {
			this._last = l;
		}
	},
	backup: function() {
		this._last = {};
		for (var prop in this._current) {
			this._last[prop] = this._current[prop];
		}
	},
	resume: function() {
		this._current = {};
		for (var prop in this._last) {
			this._current[prop] = this._current[prop];
		}
	},
	_noop: function() {}
});

