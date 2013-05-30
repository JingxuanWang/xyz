var Config = enchant.Class.create({
	classname: "Config",
	initialize: function(){
	},
	load: function(callback) {
		var self = this;
		var ajax = new Ajax();
		ajax.addEventListener(enchant.Event.LOAD, function() {
			self._all = ajax.getResponseJSON();
			self._text = ajax.getResponseText();
			callback.call();
		});
		ajax.load('js/data.json');
	},
	images: function() {
		return this._all['image'];
	},
	getMap: function() {
		return this._all['map'];
	},
	getSystem: function() {
		return this._all['system'];
	},
	playerUnits: {
		get: function() {
			return this._all['player_unit'];
		},
	},
	alliesUnits: {
		get: function() {
			return this._all['allies_unit'];
		},
	},
	enemyUnits: {
		get: function() {
			return this._all['enemy_unit'];
		},
	},
	// ajax utilities
	_noop: function() {}
});

