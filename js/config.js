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
	getPlayerUnits: function() {
		return this._all['player_unit'];
	},
	getAlliesUnits: function() {
		return this._all['allies_unit'];
	},
	getEnemyUnits: function() {
		return this._all['enemy_unit'];
	},
	// ajax utilities
	_noop: function() {}
});

