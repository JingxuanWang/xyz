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
