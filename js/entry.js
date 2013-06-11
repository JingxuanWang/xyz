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
			var battle = new BattleScene();

			// this should be moved into
			// battle.onEnter function 			
			battle.addMap(CONFIG.get(["map"]));
			battle.addUnits(CONFIG.get(["player_unit"]), "PLAYER");
			battle.addUnits(CONFIG.get(["allies_unit"]), "ALIIES");
			battle.addUnits(CONFIG.get(["enemy_unit"]), "ENEMY");

			GAME.pushScene(battle);
			
			battle.start();
		};
		GAME.start();
	});
};
