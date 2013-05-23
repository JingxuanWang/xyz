enchant();

var DOWN = 0;
var LEFT = 1;
var UP = 2;
var RIGHT = 3;
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
		enchant.Sprite.call(this, 32, 32);
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
				"fps" : 12
			},
			"MOVE" : {
				"asset" : "img/unit/Unit_mov_109.png",
				"frames" : [0, 1],
				"df" : 2,
				"fps" : 2
			},
			"WEAK" : {
				"asset" : "img/unit/Unit_mov_109.png",
				"frames" : [6, 7],
				"df" : 0,
				"fps" : 2
			},
			"STAND" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [0],
				"df" : 0,
				"fps" : 0
			},
			"DEFEND" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [4],
				"df" : 1,
				"fps" : 0
			},
			"HURT" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [8],
				"df" : 0,
				"fps" : 0
			},
			"WIN" : {
				"asset" : "img/unit/Unit_spec_109.png",
				"frames" : [9],
				"df" : 0,
				"fps" : 0
			}
		};

		this.setAnim("MOVE", RIGHT);
		
		this.attr = new Attr(attr);
		// init animations
		game.rootScene.addChild(this);
	},
	// change only direction but not animation
	setDirection: function(direction) {
		if (direction == this._current_direction) {
			return;
		}

		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._current_animation.frames.length; i++) {
			frames[i] = this._current_animation.frames[i] 
				+ this._current_animation.df * direction;
		}
		// set first frame
		this.frame = frames[this._current_frame];

		this._current_direction = direction;
		this._last_frame_update = this.age; 
	},
	// status, asset, fps, frame num should be assigned
	setAnim: function(anim, direction, frame_num){
		if (anim === null || direction === null) {
			console.log("Error Chara.setAnim: " + anim + " : " + direction);
			return;
		}

		this.image = this._Anim[anim].asset;
		var frames = [];
		// change direction for each frame
		for (var i = 0; i < this._Anim[anim].frames.length; i++) {
			frames[i] = this._Anim[anim].frames[i] 
				+ this._Anim[anim].df * direction;
		}

		frame_num = frame_num % frames.length;
		// set first frame
		this.frame = frames[frame_num];

		this._current_animation = anim;
		this._current_direction = direction;
		this._current_frame = frame_num;
		this._last_frame_update = this.age; 
	},
	getCurAnimTotalFrameNum: function() {
		return this._current_animation.frames.length === null 
			? this._current_animation.frames.length : 0;	
	},
	setCurAnimFrameNum: function(num) {
		if (this._current_animation.frames.length == 1 && num > 1) {
			console.log("Error Chara.setCurAnimFrameNum: No other frame to set");
			return;
		}
		num = num % this._current_animation.frames.length;
		this._current_frame = num;
		this._last_frame_update = this.age;
		this.frame = this._current_animation.frames[num];
	}
	setCurAnimNextFrame: function() {
		setCurAnimFrameNum(this._current_frame + 1);
	},
	shouldPlayNextFrame: function() {
		var next_frame = int((this.age % game.fps) 
			/ game.fps * this._current_animation.fps);
		return next_frame == this._current_frame ? true : false;
	},
}); 


window.onload = function(){
    var game = new Core(960, 960);
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

    game.onload = function(){

		var hero = new Sprite(48, 48);
		hero.image = game.assets[
			"img/unit/Unit_mov_109.png"
		//	"img/unit/Unit_atk_109.png",
		//	"img/unit/Unit_spc_109.png"
		];

		
		hero.x = 0;
		hero.y = 100;
		hero.frame = 2;

		var map = new Sprite(480, 480);
		map.image = game.assets["img/map/HM_1.png"];


		var scene = new Group();

		scene.addChild(map);
		scene.addChild(hero);
        game.rootScene.addChild(scene);
		
        hero.addEventListener("enterframe", function(){
			
			// normal animation
			var next_frame = (this.age % game.fps) / (game.fps / 2) + 2;
			if (this.frame != next_frame) {
				this.frame = next_frame;
			}
			// TODO:
			//if (this.shouldPlayNextFrame()) {
			//	this.setNextFrame(cur_anim);
			//}
        });

    };
    game.start();
};
