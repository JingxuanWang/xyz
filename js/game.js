var GameMain = arc.Class.create(arc.Game, {
	initialize: function(params) {
		console.log("GameMain initialize! " + "params.hp : " + params.hp);
		//var sp = new arc.display.Sprite(this._system.getImage('img/100001_1_1_1.png'));
		//sp.setX(10);
		//sp.setY(10);
		//this.addChild(sp);

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

		this.addChild(this.mc);
		//this.removeChild(mc);
		//mc.play(true);
		//mc.stop(true);
	},
	_onClick: function() {
		this.mc._timer.stop();
		this.mc.stop();
		this.removeChild(this.mc);
	},
	update: function() {
	},
});

window.addEventListener('DOMContentLoaded', function(e){
	var system = new arc.System(320, 416, 'canvas');
	system.setGameClass(GameMain, {hp:100, mp:100});

	system.addEventListener(arc.Event.PROGRESS, function(e){
		console.log(e.loaded + ", " + e.total);
	});
	
	system.addEventListener(arc.Event.COMPLETE, function(e){
		console.log('loaded');
	});
	
	system.load([
		'../../output/Unit_mov_1.png',
		'../../output/Unit_atk_1.png',
	]);
}, false);
