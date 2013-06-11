// include chara and chara effect
var Unit = enchant.Class.create(enchant.Group, {
	classname: "Unit",
	initialize: function(conf) {
		enchant.Group.call(this);
		this.x = conf.position.i * CONFIG.get(["map", "tileWidth"]); 
		this.y = conf.position.j * CONFIG.get(["map", "tileHeight"]);
		this.width = CONFIG.get(["map", "tileWidth"]);
		this.height = CONFIG.get(["map", "tileHeight"]);

		this.master_attr = new Attr(conf.attr);
		this.cur_attr = new Attr(conf.attr);
		this._status = CONSTS.unitStatus("NORMAL");

		this.chara = new Chara(conf);
		this.label = new Label("");
		this.label.color = '#ffffff';
		this.addChild(this.chara);
		this.addChild(this.label);
	},
	i: {
		get: function() {
			return Math.round(this.x / this.width);
		},
		set: function(ti) {
			this.x = ti * this.width;
		}
	},
	j: {
		get: function() {
			return Math.round(this.y / this.height);
		},
		set: function(tj) {
			this.y = tj * this.height;
		}
	},
	d: {
		get: function() {
			return this.chara.d;
		},
		set: function(td) {
			this.chara.d = td;
		}
	},

	setStatus: function(st) {
		if (UNIT_STATUS[st] == null) {
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
	attack: function(d) {
		this.chara.setAnim("ATTACK", d);
	},
	move: function(d) {
		this.chara.setAnim("MOVE", d);
	},
	resume: function() {
		this.chara.setAnim("MOVE", this.d);
		this.label.text = "";
	},
	hurt: function(damage) {
		this.chara.setAnim("HURT", this.d);
		this.label.text = damage;
	},
	master_attr: {
		get: function() {
			return this._master_attr;
		},
		set: function(attr) {
			this._master_attr = attr;
		},
	},
	last_attr: {
		get: function() {
			return this._last_attr;
		},
		set: function(attr) {
			this._last_attr = attr;
		},
	},
	cur_attr: {
		get: function() {
			return this._cur_attr;
		},
		set: function(attr) {
			this._cur_attr = attr;
		},
	},

	_noop: function() {

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

		this.master_attr = new Attr(conf.attr);
		this.cur_attr = new Attr(conf.attr);

		// should be initialized
		//this.x = conf.position.i * CONFIG.get(["map", "tileWidth"]); 
		//this.y = conf.position.j * CONFIG.get(["map", "tileHeight"]);
		this.width = CONFIG.get(["map", "tileWidth"]);
		this.height = CONFIG.get(["map", "tileHeight"]);
		//console.log("Chara.initialized:  x: " + this.x + " y: " + this.y + " width: " + this.width + " height: " + this.height);
		this._status = CONSTS.unitStatus("NORMAL");
		
		this._anims = {
			"ATTACK" : {
				"asset" : conf.resource.img_atk,
				"frames" : [0, 0, 1, 2, 3, 3],
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
	i: {
		get: function() {
			return Math.round(this.x / this.width);
		},
		set: function(ti) {
			this.x = ti * this.width;
		}
	},
	j: {
		get: function() {
			return Math.round(this.y / this.height);
		},
		set: function(tj) {
			this.y = tj * this.height;
		}
	},
	d: {
		get: function() {
			return this._cur_direction;
		},
		set: function(td) {
			this._cur_direction = td;
		}
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this.d) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._cur_anim.frames.length; i++) {
			frames[i] = this._cur_anim.frames[i] + this._cur_anim.df * direction;
		}
		// set first frame
		this.frame = frames[this._cur_frame];

		this.d = direction;
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
		if (anim == null || (direction == null && this.d == null)) {
			console.log("Error Chara.setAnim: " + anim + " : " + direction);
			return;
		}
		if (direction !== null) {
			this.d = direction;
		}

		this.image = GAME.assets[this._anims[anim].asset];
		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._anims[anim].frames.length; i++) {
			frames[i] = this._anims[anim].frames[i] + this._anims[anim].df * this.d;
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
		this._cur_frame = frame_num;
		this._last_frame_update = this.age;
		//console.log("Chara: setAnim: " + this._cur_frame + " : " + frames.length);
	},
	getCurAnimTotalFrameNum: function() {
		return this._cur_anim.frames.length == null ? this._cur_anim.frames.length : 0;	
	},
	setCurAnimFrameNum: function(num) {
		if (this._cur_anim.frames.length == 1 && num > 1) {
			console.log("Error Chara.setCurAnimFrameNum: No other frame to set");
			return;
		}
		if (this._cur_anim.frames.length == num + 1) {
			this.dispatchEvent("onactionend");
			if (this._cur_anim.loop === false) {
				return;
			}
		}

		num = num % this._cur_anim.frames.length;
		this._cur_frame = num;
		this._last_frame_update = this.age;
		this.frame = this._cur_anim.frames[num] + this._cur_anim.df * this.d;
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
	master_attr: {
		get: function() {
			return this._master_attr;
		},
		set: function(attr) {
			this._master_attr = attr;
		},
	},
	last_attr: {
		get: function() {
			return this._last_attr;
		},
		set: function(attr) {
			this._last_attr = attr;
		},
	},
	cur_attr: {
		get: function() {
			return this._cur_attr;
		},
		set: function(attr) {
			this._cur_attr = attr;
		},
	},
	noop: function() {}
}); 

