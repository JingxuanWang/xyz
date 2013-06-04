enchant();

var GAME;
var CONFIG;
var CONSTS;

function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	};
}

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

	_noop: function(){}
});
var Ajax = enchant.Class.create(enchant.EventTarget, {
	classname: "Ajax",
	_method: 'GET', 
	_params: null, 
	_url: null,
	_request: null, 
	_jsonResponse: null, 

	initialize: function(){
		enchant.EventTarget.call(this);
		this._request = new XMLHttpRequest();
		this._loadedCallBack = bind(this._loaded, this);
	},
	load: function(url, params){
		this._url = url;
		this._params = params;
		this._request.open(this._method, this._url, true);
		this._request.onreadystatechange = bind(this._loaded, this);
		this._request.addEventListener('readystatechange', this._loadedCallback, false);
		this._request.send(this._params);
	},
	_loaded: function(){
		if(this._request.readyState == 4){
			if(this._request.status == 200 || this._request.status === 0){
				this.dispatchEvent(new enchant.Event(enchant.Event.LOAD));
			} else {
				this.dispatchEvent(new enchant.Event(enchant.Event.ERROR));
				throw new Error("Load Error : " + this._url);
			}
		}
	},
	unload: function(){
		this._request.abort();
		this._jsonResponse = null;
		this._request.removeEventListener('readystatechange', this_loadedCallback, false);
	},
	setMethod: function(method){
		this._method = method;
	},
	getResponseText: function(){
		return this._request.responseText;
	},
	getResponseJSON: function(){
		if(!this._jsonResponse){
			this._jsonResponse = JSON.parse(this._request.responseText);
		}
		return this._jsonResponse;
	},
	getURL: function(){
		return this._url;
	}
});
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
		ajax.load('js/xyz.json');
	},
	get: function(arr) {
		var a = this._all;
		for (var i = 0; i < arr.length; i++) {
			if (a.hasOwnProperty(arr[i])) {
				a = a[arr[i]];
			} else {
				return null;
			}
		}
		return a;
	},
	// ajax utilities
	_noop: function() {}
});

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
	
	initialize: function(attr) {
		this.chara_id = attr.chara_id;
		this.name = attr.name;
		this.level = attr.level;
		this.school = attr.school;
		this.rank = attr.rank;
		this.hp = attr.hp;
		this.mp = attr.mp;
		this.atk = attr.atk;
		this.def = attr.def;
		this.intl = attr.intl;
		this.dex = attr.dex;
		this.mor = attr.mor;
		this.mov = attr.mov;
		this.rng = attr.rng;
		this.exp = attr.exp ? attr.exp : 0;
	},
	compare: function(attr) {
		for (var prop in this) {
			if (this[prop] != attr.prop) {
				return false;
			}
		}
		return true;
	}
});

var Chara = enchant.Class.create(enchant.Sprite, {
	classname: "Chara",
	initialize: function(conf) {
		enchant.Sprite.call(
			this, 
			conf.position.i * CONFIG.get(["map", "tileWidth"]),
			conf.position.j * CONFIG.get(["map", "tileHeight"])
		);

		this.masterAttr = new Attr(conf.attr);
		this.curAttr = new Attr(conf.attr);

		// should be initialized
		this.x = conf.position.i * CONFIG.get(["map", "tileWidth"]); 
		this.y = conf.position.j * CONFIG.get(["map", "tileHeight"]);
		this.width = 48;
		this.height = 48;
		//console.log("Chara.initialized:  x: " + this.x + " y: " + this.y + " width: " + this.width + " height: " + this.height);
		this._status = CONSTS.unitStatus("NORMAL");
		
		this._anims = {
			"ATTACK" : {
				"asset" : conf.resource.img_atk,
				"frames" : [0, 0, 0, 0, 0, 1, 2, 3],
				// df stand for direction factor
				"df" : 4,
				"fps" : 12,
				"loop" : false,
				"width" : 64,
				"height" : 64
			},
			"MOVE" : {
				"asset" : conf.resource.img_mov,
				"frames" : [0, 1],
				"df" : 2,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"WEAK" : {
				"asset" : conf.resource.img_mov,
				"frames" : [6, 7],
				"df" : 0,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"STAND" : {
				"asset" : conf.resource.img_spc,
				"frames" : [0],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"DEFEND" : {
				"asset" : conf.resource.img_spc,
				"frames" : [4],
				"df" : 1,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"HURT" : {
				"asset" : conf.resource.img_spc,
				"frames" : [8],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"WIN" : {
				"asset" : conf.resource.img_spc,
				"frames" : [9],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			}
		};

		this.setAnim("MOVE", conf.position.d);
		
		this.addEventListener("enterframe", function(){
			if (this.shouldPlayNextFrame()) {
				this.setCurAnimNextFrame();
			}
		});
	},
	setStatus: function(st) {
		if (UNIT_STATUS[st] === null) {
			console.log("Chara: setStatus undefined status: " + st);
		}
		this._status = UNIT_STATUS[st];
	},
	canMove: function() {
		if (this._status != CONSTS.unitStatus("MOVED") && 
			this._status != CONSTS.unitStatus("ACTIONED") && 
			this._status != CONSTS.unitStatus("DEAD")) {
			return true;
		}
		return false;
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this._cur_direction) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._cur_anim.frames.length; i++) {
			frames[i] = this._cur_anim.frames[i] + this._cur_anim.df * direction;
		}
		// set first frame
		this.frame = frames[this._cur_frame];

		this._cur_direction = direction;
		this._last_frame_update = this.age; 
	},
	// called when sprite image size changed
	_adjustNewSize: function(newWidth, newHeight) {
		this.x += (this.width - newWidth) / 2;
		this.y += (this.height - newHeight) / 2;
		this.width = newWidth;
		this.height = newHeight;
		//console.log("Chara._adjustNewSize: " + this.x + " : " + this.y + " : " + this.width + " : " + newWidth);
	},
	// status, asset, fps, frame num should be assigned
	setAnim: function(anim, direction, frame_num){
		if (anim === null || direction === null) {
			console.log("Error Chara.setAnim: " + anim + " : " + direction);
			return;
		}

		this.image = GAME.assets[this._anims[anim].asset];
		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._anims[anim].frames.length; i++) {
			frames[i] = this._anims[anim].frames[i] + this._anims[anim].df * direction;
		}
		if (!frame_num) {
			frame_num = 0;
		} else {
			frame_num = frame_num % frames.length;
		}
		// set first frame
		this.frame = frames[frame_num];
		this._adjustNewSize(this._anims[anim].width, this._anims[anim].height);


		this._cur_anim = this._anims[anim];
		this._cur_direction = direction;
		this._cur_frame = frame_num;
		this._last_frame_update = this.age;
		//console.log("Chara: setAnim: " + this._cur_frame + " : " + frames.length);
	},
	getCurAnimTotalFrameNum: function() {
		return this._cur_anim.frames.length === null ? this._cur_anim.frames.length : 0;	
	},
	setCurAnimFrameNum: function(num) {
		if (this._cur_anim.frames.length == 1 && num > 1) {
			console.log("Error Chara.setCurAnimFrameNum: No other frame to set");
			return;
		}
		if (this._cur_anim.frames.length == num + 1 && this._cur_anim.loop === false) {
			return;
		}

		num = num % this._cur_anim.frames.length;
		this._cur_frame = num;
		this._last_frame_update = this.age;
		this.frame = this._cur_anim.frames[num] + this._cur_anim.df * this._cur_direction;
		//console.log("Chara: setCurAnimFrameNum: " + this._cur_frame + " : " + this.frame + " : " + this.age);
	},
	setCurAnimNextFrame: function() {
		//console.log("Chara: setCurAnimNextFrame: " + this._cur_frame + " : " + this.age);
		this.setCurAnimFrameNum(this._cur_frame + 1);
	},
	shouldPlayNextFrame: function() {
		//console.log("Chara: shouldPlayNextFrame: " + this._cur_frame + " : " + this.age);
		var next_frame = ~~((this.age % GAME.fps) / GAME.fps * this._cur_anim.fps);
		return next_frame == this._cur_frame ? true : false;
	},
	masterAttr: {
		get: function() {
			return this._master_attr;
		},
		set: function(attr) {
			this._master_attr = attr;
		},
	},
	lastAttr: {
		get: function() {
			return this._last_attr;
		},
		set: function(attr) {
			this._last_attr = attr;
		},
	},
	curAttr: {
		get: function() {
			return this._cur_attr;
		},
		set: function(attr) {
			this._cur_attr = attr;
		},
	},
	noop: function() {}
}); 

var MoveShade = enchant.Class.create(enchant.Sprite, {
	classname: "MoveShade",
	initialize: function(grid, width, height, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		this.image = GAME.assets[CONFIG.get(["UI", "mov_base"])];
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});

	},
	_noop: function() {}	
});

var AttackShade = enchant.Class.create(enchant.Sprite, {
	classname: "AttackShade",
	initialize: function(grid, width, height, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		this.image = GAME.assets[CONFIG.get(["UI", "ar"])];
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});
	},

	_noop: function() {}	
});

// containts button & label & image
var Menu = enchant.Class.create(enchant.Group, {
	classname: "Menu",
	buttons: ["atk", "mov"],
	initialize: function(x, y, chara, cb_list) {
		this.drawBackround();
		for (var i = 0; i < buttons.length; i ++) {
			var type = buttons[i];
			var cb = cb_list[type];
			addButton(x, y, w, h, type, cb);
		}
	},
	drawBackground: function() {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	addButton: function(type, cb) {
		var button = new Button(x, y, w, h, type, cb);
		this.addChild(button);
	},
	_noop: function() {}	
});


// a button contains a image and a lable
var Button = enchant.Class.create(enchant.Group, {
	classname: "Button",
	initialize: function(x, y, image, text, cb) {
		enchant.Group.call(this, w, h);
		this.addLabel(text);
		this.moveTo(x, y);
		this.width = 40;
		this.height = 40;
		this.drawBackground();

		if (type == "atk") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_atk"])]);
		} else if (type == "mov") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_mov"])]);
		} else {
			console.log("invalide type");
		}

		this._pressed = false;
		this.addEventListener(enchant.Event.TOUCH_START, function() {
			this._pressed = true;
			this.y++;
			this.changeStyle();
			callback.call();
		});
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			this._pressed = false;
			this.y--;
			this.changeStyle();
			callback.call();
		});
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	changeStyle: function() {
		// currently only the background
		if (this._pressed === true) {
			this.bg.image.context.fillStyle = '#fff';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		} else {
			this.bg.image.context.fillStyle = '#333';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		}
	},
	addImage: function(image) {
		// fixed width/height
		var img = new Sprite(32, 32);
		img.image = image;
		img.moveTo(2, 2);
		this.img = img;
		this.addChild(img);
	},
	addLabel: function(text) {
		var lb = new Label(text);
		lb.moveTo(36, 2);
		this.lb = lb;
		this.addChild(lb); 
	},
	_noop: function() {}	

});

// contains hp/mp bar & label & image
var InfoBox = enchant.Class.create(enchant.Group, {
	classname: "InfoBox",
	initialize: function(x, y, chara, type) {
		enchant.Group.call(this, w, h);
		this.chara = chara;
		this.type = type;
	
		this.setBasePoint(chara.x, chara.y);	
		this.drawBackground(CONFIG.get(["Menu", "base"]));

		this.setName();
		this.setSchool();
		if (this.type == CONSTS.side("PLAYER")) {
			this.setHpStat();
			this.setMpStat();
			this.setExpStat();
		}
	},
	chara: {
		get: function() {
			return this._chara;
		},
		set: function(chara) {
			this._chara = chara;
		}
	},
	type: {
		get: function() {
			return this._type;
		},
		set: function(type) {
			this._type = type;
		}
	},
	change: function(hp, mp, exp, atk, def) {
		this.hp_bar.value = hp;
		this.mp_bar.value = mp;
		this.exp_bar.value = exp;
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	setBasePoint: function(x, y) {
		if (x >= CONFIG.get(["system", "width"]) / 2) {
			this.x = x - 4 * CONFIG.get(["map", "tileWidth"]);
		} else {
			this.x = x + CONFIG.get(["map", "tileWidth"]);
		}
		if (y >= CONFIG.get(["system", "height"]) / 2) {
			if (this._type === 1 && this._style === 0) {
				this.y = y - 2 * CONFIG.get(["map", "tileHeight"]);
			} else {
				this.y = y - CONFIG.get(["map", "tileHeight"]);
			}
		} else {
			this.y = y;
		}
	},
	setName: function() {
		this.name = new Label(chara.curAttr.name);
		this.name.moveTo(4, 4);
		this.addChild(this.name);
	},
	setSchool: function() {
		this.school = new Label(chara.curAttr.school);
		this.school.moveTo(4, 30);
		this.addChild(this.school);
	},
	setLv: function() {
	},
	setHpStat: function() {
		// image + bar + lable
		// image
		this.hp_img = new Sprite(32, 32);
		this.hp_bar = new Bar(20, 100);
		this.hp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "hp"])];
		this.hp_bar.maxvalue = chara.masterAttr.hp;
		this.hp_bar.value = chara.curAttr.hp;
	},
	setMpStat: function() {
		this.mp_bar = new Bar(20, 100);
		this.mp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "mp"])];
		this.mp_bar.maxvalue = chara.masterAttr.mp;
		this.mp_bar.value = chara.curAttr.mp;
	},
	setExpStat: function() {
		this.exp_bar = new Bar(20, 100);
		this.exp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "exp"])];
		this.exp_bar.maxvalue = chara.masterAttr.exp;
		this.exp_bar.value = chara.curAttr.exp;
	},

	_noop: function() {}	
});

/*
   // Bar
	var bar = new Bar(20, 100);
	bar.image = game.assets["bar.png"];
	bar.maxvalue = 200;
	bar.value = 0;
	bar.on("enterframe", function() {
		if (this.age % 60 == 0) {
			this.value = Math.random() * 200;
		}   
	}); 
	game.rootScene.addChild(bar);
*/
var Bar = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 1, 16);
        this.image = new enchant.Surface(1, 16);// Null用
        this.image.context.fillColor = 'RGB(0, 0, 256)';
        this.image.context.fillRect(0, 0, 1, 16);
        this._direction = 'right';
        this._origin = 0;
        this._maxvalue = enchant.Game.instance.width;
        this._lastvalue = 0;
        this.value = 0;
        this.easing = 5;
        switch (arguments.length) {
            case 2:
                this.y = y;
                this.x = x;
                this._origin = x;
                break;
            case 1:
                this.x = x;
                this._origin = x;
                break;
            default:
                break;
        }
        this.addEventListener('enterframe', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            this._lastvalue += (this.value - this._lastvalue) / this.easing;
            if (Math.abs(this._lastvalue - this.value) < 1.3) {
                this._lastvalue = this.value;
            }
            this.width = (this._lastvalue) | 0;
            if (this.width > this._maxvalue) {
                this.width = this._maxvalue;
            }
            if (this._direction === 'left') {
                this._x = this._origin - this.width;
            } else {
                this._x = this._origin;
            }
            this._updateCoordinate();
        });
    },
    direction: {
        get: function() {
            return this._direction;
        },
        set: function(newdirection) {
            if (newdirection !== 'right' && newdirection !== 'left') {
                // ignore
            } else {
                this._direction = newdirection;
            }
        }
    },
    x: {
        get: function() {
            return this._origin;
        },
        set: function(x) {
            this._x = x;
            this._origin = x;
            this._dirty = true;
        }
    },
    maxvalue: {
        get: function() {
            return this._maxvalue;
        },
        set: function(val) {
            this._maxvalue = val;
        }
    }
});


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

// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	CONSTS = new Consts();
	CONFIG = new Config();
	CONFIG.load(function(){
		GAME = new Core(CONFIG.get(["System", "width"]), CONFIG.get(["System", "height"]));
		GAME.fps = 60;

		GAME.preload(CONFIG.get(["image"]));
		GAME.onload = function(){
			var battle = new Battle();
			
			battle.addMap(CONFIG.get(["map"]));
			battle.addUnits(CONFIG.get(["player_unit"]), "PLAYER");
			battle.addUnits(CONFIG.get(["allies_unit"]), "ALIIES");
			battle.addUnits(CONFIG.get(["enemy_unit"]), "ENEMY");

			GAME.rootScene.addChild(battle);
			
			battle.start();
		};
		GAME.start();
	});
};
