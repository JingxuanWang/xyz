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
			battle.addPlayerUnits(CONFIG.get(["player_unit"]));
			battle.addAlliesUnits(CONFIG.get(["allies_unit"]));
			battle.addEnemyUnits(CONFIG.get(["enemy_unit"]));

			GAME.rootScene.addChild(battle);
			
			battle.start();
		};
		GAME.start();
	});
};
