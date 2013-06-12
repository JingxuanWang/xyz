// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	CONSTS = new Consts();
	CONFIG = new Config();
	CONFIG.load(function(){
		GAME = new Core(CONFIG.get(["system", "width"]), CONFIG.get(["system", "height"]));
		GAME.fps = 60;

		GAME.preload(CONFIG.get(["image"]));
		GAME.onload = function(){
			var battle = new BattleScene();
			GAME.pushScene(battle);
			battle.start();
		};
		GAME.start();
	});
};
