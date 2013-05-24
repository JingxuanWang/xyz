enchant();

var GAME;
var DOWN = 0;
var RIGHT = 1;
var UP = 2;
var LEFT = 3;
var SPEED = 2;

var Attr = enchant.Class.create({
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
		this.cur_hp = attr.cur_hp ? attr.cur_hp : this.hp;
		this.cur_mp = attr.cur_mp ? attr.cur_mp : this.mp;
		this.cur_exp = attr.cur_exp;
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
	initialize: function(x, y, attr) {
		enchant.Sprite.call(this, x, y);
		this.x = x;
		this.y = y;
		//this.image = game.assets['chara1.png'];
		//this.frame = 5;
		// TODO: to read these by config
		this._anims = {
			"ATTACK" : {
				"asset" : "img/unit/Unit_atk_109.png",
				"frames" : [0, 0, 0, 0, 0, 1, 2, 3],
				// df stand for direction factor
				"df" : 4,
				"fps" : 12,
				"loop" : false,
				"width" : 64,
				"height" : 64
			},
			"MOVE" : {
				"asset" : "img/unit/Unit_mov_109.png",
				"frames" : [0, 1],
				"df" : 2,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"WEAK" : {
				"asset" : "img/unit/Unit_mov_109.png",
				"frames" : [6, 7],
				"df" : 0,
				"fps" : 2,
				"loop" : true,
				"width" : 48,
				"height" : 48
			},
			"STAND" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [0],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"DEFEND" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [4],
				"df" : 1,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"HURT" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [8],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			},
			"WIN" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [9],
				"df" : 0,
				"fps" : 0,
				"loop" : false,
				"width" : 48,
				"height" : 48
			}
		};

		this.setAnim("MOVE", LEFT);
		//this.setAnim("ATTACK", RIGHT);
		var self = this;
		//this.tl.moveX(100, 50).action({
		this.tl.action({
			time: 60,
			// action start
			onactionstart: function(evt){
				self.setAnim("ATTACK", LEFT);
			}, 
			// action tick
			onactiontick: function(evt){
		
			}, 
			// action end
			onactionend: function(evt){
				self.setAnim("MOVE", LEFT);
			},
			}
		);
		
		this.addEventListener("enterframe", function(){
			if (this.shouldPlayNextFrame()) {
				this.setCurAnimNextFrame();
			}
		});

		// for non-loop animation
		// we should add a "animation complete" event
		// to handle what to do next
		// TODO: see ACTION & PARALELL ACTION
	
		//this.attr = new Attr(attr);
		// init animations
		GAME.rootScene.addChild(this);
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this._cur_direction) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._cur_anim.frames.length; i++) {
			frames[i] = this._cur_anim.frames[i] 
				+ this._cur_anim.df * direction;
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
		console.log(this.x + " : " + this.y + " : " + this.width + " : " + newWidth);
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
			frames[i] = this._anims[anim].frames[i] 
				+ this._anims[anim].df * direction;
		}
		if (!frame_num) {
			frame_num = 0;
		} else {
			frame_num = frame_num % frames.length;
		}
		// set first frame
		this.frame = frames[frame_num];
		this.adjustNewSize(this._anims[anim].width, this._anims[anim].height);


		this._cur_anim = this._anims[anim];
		this._cur_direction = direction;
		this._cur_frame = frame_num;
		this._last_frame_update = this.age;
		//console.log("Chara: setAnim: " + this._cur_frame + " : " + frames.length);
	},
	getCurAnimTotalFrameNum: function() {
		return this._cur_anim.frames.length === null 
			? this._cur_anim.frames.length : 0;	
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
		var next_frame = ~~((this.age % GAME.fps) 
			/ GAME.fps * this._cur_anim.fps);
		return next_frame == this._cur_frame ? true : false;
	},
}); 


window.onload = function(){
    var game = new Core(480, 480);
    game.fps = 60;
    game.preload("img/chara1.png");
    game.preload([
		"img/map/HM_1.png", 
		"img/unit/Unit_mov_109.png",
		"img/unit/Unit_atk_109.png",
		"img/unit/Unit_spc_109.png",
		"img/unit/Unit_mov_3.png",
		"img/unit/Unit_atk_3.png",
		"img/unit/Unit_spc_3.png"
	]);
	GAME = game;

    game.onload = function(){
		/*
		var hero = new Sprite(48, 48);
		hero.image = game.assets["img/unit/Unit_mov_109.png"];
		
		hero.x = 0;
		hero.y = 100;
		hero.frame = 2;
		*/
		var hero = new Chara(240, 240);
		
		var map = new Sprite(480, 480);
		map.image = game.assets["img/map/HM_1.png"];

		var scene = new Group();

		scene.addChild(map);
		scene.addChild(hero);
        game.rootScene.addChild(scene);
		
        hero.addEventListener("enterframe", function(){
			
			// normal animation
			//var next_frame = (this.age % game.fps) / (game.fps / 2) + 2;
			//if (this.frame != next_frame) {
			//	this.frame = next_frame;
			//}
			// TODO:
			//if (this.shouldPlayNextFrame()) {
			//	this.setCurAnimNextFrame();
			//}
        });

    };
    game.start();
};
