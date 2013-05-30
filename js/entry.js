// ---------------------
// Game Main
// ---------------------
window.onload = function(){
	CONSTS = new Consts();
	CONFIG = new Config();
	CONFIG.load(function(){
		GAME = new Core(CONFIG.getSystem.width, CONFIG.getSystem.height);
		GAME.fps = 60;

		GAME.preload(CONFIG.images());
		GAME.onload = function(){
			var battle = new Battle();
			
			battle.addMap(CONFIG.getMap());
			battle.addPlayerUnits(CONFIG.playerUnits);
			battle.addAlliesUnits(CONFIG.alliesUnits);
			battle.addEnemyUnits(CONFIG.enemyUnits);

			GAME.rootScene.addChild(battle);
			
			battle.start();
		};
		GAME.start();
	});
};
