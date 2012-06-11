var system;

var GameMain = arc.Class.create(arc.Game, {
	initialize: function(params) {
		console.log("GameMain initialize! " + "params.hp : " + params.hp);
		//var sp = new arc.display.Sprite(system.getImage('img/unit/Unit_mov_1.png'));
		//sp.setX(10);
		//sp.setY(10);
		//this.addChild(sp);
/*
		this.mc = new arc.display.MovieClip(6, true); 

		var mc1 = new arc.display.SheetMovieClip(
			this._system.getImage('../../output/Unit_mov_1.png', [48, 0, 96, 48]), 
			48, 2
		);
		var mc2 = new arc.display.SheetMovieClip(
			this._system.getImage('../../output/Unit_atk_1.png', [0, 0, 256, 64]), 
			64, 4
		);
		this.mc.addChild(mc1, {
			5 : {x:8, y:8, scaleX: 1, scaleY: 1},
			6 : {x:8, y:8, scaleX: 1, scaleY: 1},
		});
		this.mc.addChild(mc2, {
			1 : {x:0, y:0, scaleX: 1, scaleY: 1},
			2 : {x:0, y:0, scaleX: 1, scaleY: 1},
			3 : {x:0, y:0, scaleX: 1, scaleY: 1},
			4 : {x:0, y:0, scaleX: 1, scaleY: 1},
		});

		this.mc.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClick, this));
*/
		
		this._d = 0;
		this.unit = new UnitAnim();
		this.addChild(this.unit);
		//this.removeChild(mc);
		//mc.play(true);
		//mc.stop(true);
	},
	_onClick: function() {
	},
	update: function() {
	},
});

window.addEventListener('DOMContentLoaded', function(e){
	system = new arc.System(320, 416, 'canvas');
	system.setGameClass(GameMain, {hp:100, mp:100});
	//system.setGameClass(UnitAnim, {hp:100, mp:100});

	system.addEventListener(arc.Event.PROGRESS, function(e){
		console.log(e.loaded + ", " + e.total);
	});
	
	system.addEventListener(arc.Event.COMPLETE, function(e){
		console.log('loaded');
	});
	
	system.load([
		'img/unit/Unit_mov_1.png',
		'img/unit/Unit_atk_1.png',
		'img/unit/Unit_spc_1.png',
	]);
}, false);


var UnitAnim = arc.Class.create(arc.Game, {
	_name: "UnitAnim",
	_stat: "normal",
	_direction: "left",

	initialize: function() {
		// laod resoruce according unit type
		this.anim_mov = new arc.display.MovieClip(2, true, true); 

		this._move = [];
		for (var i = 0; i < 3; ++i) {
			this._move[i] = new arc.display.SheetMovieClip(
				system.getImage(
					'img/unit/Unit_mov_1.png', 
					[48, i * 48, 96, 48]
				), 
				48, 2
			);
		}
		this._d = 0;
		this.anim_mov.addChild(
			this._move[0], 
			{
				1: {scaleX: 1, scaleY: 1, rotatation: 90}, 
				2: {scaleX: 1, scaleY: 1}, 
			}
		);
		this.addChild(this.anim_mov);
		this.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClick, this));
	},

	// animations with direction
	attack: function(direction) {
	},
	move: function(direction) {
		this._removeAllChild();
		this.anim_mov.addChild(this._move[direction], {1:{}, 2:{}});
		this.addChild(this.anim_mov);
	},
	stand: function(direction) {
	},

	// animations without direction
	hurt: function() {
	},
	weak: function() {
	},
	power_up: function() {
	},
	
	
	_onClick: function() {
		this._d = (this._d + 1) % 3;
		this.move(this._d);
	},
});

