// Basic Game Logic

// move to local json or download from server
var data = {
	"500001" : {
		"1" : {
			"hp" : 200,
			"mp" : 50,
			"atk" : 50,
			"def" : 30,
			"wiz" : 20,
			"dex" : 25,
			"mor" : 4,
			"spd" : 100,
			"mov" : 3,
			"min_exp" : 1,
			"max_exp" : 100
		}
	}
};

// For local version, attr table should be store in a JSON file
var Attr = Class.subclass({
	classname: 'Attr',
	initialize: function(json) {
		this.hp = json.hp;
		this.mp = json.mp;
		this.atk = json.atk;
		this.def = json.def;
		this.wiz = json.wiz;
		this.dex = json.dex;
		this.mor = json.mor; 	// morale
		this.spd = json.spd;
		this.mov = json.mov;
		this.lv = json.lv
		this.min_exp = json.min_exp;
		this.max_exp = json.max_exp;
	},
	get: function(name){
		return this[name];
	},
	set: function(name, value) {
		this[name] = value;
	} 
});

var Chara = Class.subclass({
	classname: 'Chara',
	initialize: function(json) {
		this._status = "normal";
		this._attr = new Attr(json);
		this._unit = new Unit();
		this._anim;
		
		// basic information
		this.chara_id = json.chara_id;
		this.chara_lv = json.chara_lv;

		// init hp & mp should copy from Attr
		this.hp = this._attr.hp;
		this.mp = this._attr.mp;
		
		// should get from save data
		this.exp = this._attr.min_exp; 	

		// assign basic attr
		this.refreshAttr(1);
	},

	// bind render module
	getUnit: function() {
		return this._unit;
	},
	setUnit: function(unit) {
		this._unit = unit;
	},

	// chara's animation & sound effects
	anim_attack: function(level, critical) {
		// play different animation according to level
	},
	anim_defence: function() {
	},
	anim_hurt: function() {
	},
	anim_dying: function() {
	},
	anim_move: function(dx, dy) {
	},
	anim_die: function() {
	},
	anim_levelup: function() {
	},
	
	// setter and getter
	get: function(key) {
		return this._attr.get(key);
	},
	set: function(key, value) {
		return this._attr.set(key, value);
	},
	refreshAttr: function(rate) {
		var basic_attr = ["atk", "def", "wiz", "dex"];
		for (var attr in basic_attr) {
			this[attr] = parseInt(basic_attr[attr] * rate);
		}
	},
	heal: function(value) {
		this.hp += value;
		if (this.hp >= this.get("hp")) {
			this.hp = this.get("hp");
		}
	},
	hurt: function(value) {
		this.hp -= value;
		if (this.hp <= 0) {
			this.hp = 0;
			this.status = "dead";
		}
	},
	levelup: function() {
		var lv = this.chara_lv;
		while(true) {
			++lv;
			var attr = data[this.chara_id][lv];
			if (!attr) {
				return;
			}
			if (attr.max_exp > this.exp) {
				this._attr = new Attr(data[this.chara_id][lv]);
				this.refreshAttr(1);
				return;
			}
			// dead loop protection
			if (lv > 100) {
				return;
			}
		}
	},
	inc_exp: function(value) {
		this.exp += value;
		if (this.exp >= this.get("max_exp")) {
			this.levelup();
		}
	}
});

function attack(attacker, defender) {
	var dmg = attacker.atk - defender.def;
	return dmg > 0 ? dmg : 1;
}

function mattack(attacker, defender) {
	var dmg = attacker.wiz;
	return dmg;
}

function loadCharaMaster() {
	// init a XMLHTTPRequest for AJAX
	var xmlhttp;
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = ActiveXObject("Microsoft.XMLHTTP");
	}

	// if we have suceed on receiving data
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var json = JSON.parse(xmlhttp.responseText);
			if (json.chara.length == 0) {
				alert("no data");
				return;
			}
			data = json.chara;
		}
	}

	function makeUrl() {
		//return "http://ninja.mbga.mbgadev.cn/_slg_getCharaAttr";
		return "data.json";
	}


	var url = makeUrl();
	// determine the url and parameters of this request
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function initChara() {
}

