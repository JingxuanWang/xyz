// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	var config = new Config();
	config.load(function(){
		var game = new Core(480, 480);
		game.fps = 60;
		GAME = game;

		//game.preload(config.test);
		game.preload(config.images());
		game.onload = function(){
			//return;
			/*
			var hero = new Sprite(48, 48);
			hero.image = game.assets["img/unit/Unit_mov_109.png"];
			
			hero.x = 0;
			hero.y = 100;
			hero.frame = 2;
			*/
			var hero = new Chara(240, 240, {chara_id: 109});
			var enemy = new Chara(200, 200, {chara_id: 3});
			
			//var map = new Sprite(480, 480);
			var map = new Map(48, 48);
			map.image = game.assets["img/map/HM_1.png"];
			var matrix = [];
			for (var i = 0; i < 20; i++) {
				matrix[i] = [];
				for (var j = 0; j < 20; j++) {
					matrix[i][j] = i * 20 + j;
				}
			}
			map.loadData(matrix);
			var scene = new Battle();
			
			scene.addMap(map);
			scene.addChild(hero);
			scene.addChild(enemy);

			game.rootScene.addChild(scene);


	// Animation
			scene.tl.action({
				time: 60,
				// action start
				onactionstart: function(evt){
					hero.setAnim("ATTACK", LEFT);
				}, 
				// action tick
				onactiontick: function(evt){
			
				}, 
				// action end
				onactionend: function(evt){
					hero.setAnim("MOVE", LEFT);
					scene.start();
				},
			});
		};
		game.start();


	});
};
