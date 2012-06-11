var PRODUCTION = 1;

var vim =  {
	screens:[]
};

var PRODUCTION = PRODUCTION || 0;
vim.loader = ( 
		function() {
			var e = 0, 
				d = 0, 
				c = /\.(jpg|png|gif)$/i,
				b = /\.(wav|mp3|ogg)$/i;
			function f(k) {
				var n = c.test(k.url),
					m = b.test(k.url),
					i,j,l;
				k.noexec = n || m;
				e += 1;
				k.autoCallback = function(p, o, q) {
					d += 1;
					if(n) {
						vim.images.load(q, p)
					} else {
						if(m) {
							i = k.url.lastIndexOf("/");
							j = k.url.lastIndexOf(".");
							l = k.url.substring(i+1,j);
							vim.audio.prepare(l)
						} 
					} 
				};
				return k
			} 
			function g() {
				var i = vim.audio;
				yepnope.addPrefix("loader",f);
				yepnope( {
					load: {
						grass:"loader!images/Grass%20Block.png", 
						water:"loader!images/Water%20Block.png", 
						stone:"loader!images/Stone%20Block.png", 
						plain:"loader!images/Plain%20Block.png", 
						stone_tall:"loader!images/Stone%20Block%20Tall.png", 
						dirt:"loader!images/Dirt%20Block.png", 
						speech:"loader!images/SpeechBubble.png", 
						shadow_east:"loader!images/Shadow%20East.png", 
						shadow_west:"loader!images/Shadow%20West.png", 
						shadow_north:"loader!images/Shadow%20North.png", 
						shadow_south:"loader!images/Shadow%20South.png", 
						shadow_north_east:"loader!images/Shadow%20North%20East.png", 
						shadow_north_west:"loader!images/Shadow%20North%20West.png", 
						shadow_south_east:"loader!images/Shadow%20South%20East.png", 
						shadow_south_west:"loader!images/Shadow%20South%20West.png", 
						ramp_west:"loader!images/Ramp%20West.png", 
						ramp_east:"loader!images/Ramp%20East.png", 
						rock:"loader!images/Rock.png", 
						candle:"loader!images/Candle_icon.png", 
						tall_tree:"loader!images/Tree%20Tall.png", 
						kid:"loader!images/Character%20Boy.png", 
						pink_girl:"loader!images/Character%20Pink%20Girl.png", 
						princess:"loader!images/Character%20Princess%20Girl.png", 
						closed_door:"loader!images/Door%20Tall%20Closed.png", 
						yellow_key:"loader!images/Key.png", 
						small_brown_key:"loader!images/Small%20Brown%20Key.png", 
						keyboard_key:"loader!images/Plain%20Block.png", 
						closed_chest:"loader!images/Chest%20Closed.png", 
						open_chest:"loader!images/Chest%20Open.png", 
						chest_lid:"loader!images/Chest%20Lid.png", 
						cat_girl:"loader!images/Character%20Cat%20Girl.png", 
						horn_girl:"loader!images/Character%20Horn%20Girl.png"
					},
					complete: function() {
						vim.game.showScreen("main-menu")
					} 
				})
			} 
			function a() {
			if( PRODUCTION===0 ) {
				Modernizr.load([ {
					load:[
						"js/sizzle.js",
						"js/dom.js",
						"js/soundmanager2-nodebug-jsmin.js",
						"js/audio.js",
						"js/game.js",
						"js/screen.splash.js",
						"js/screen.main-menu.js",
						"js/screen.credits-screen.js",
						"js/screen.register-screen.js",
						"js/screen.instructions-screen.js",
						"js/images.js",
						"js/inventory.js",
						"js/keys.js",
						"js/timer.js",
						"js/fetcher.js",
						"js/textarea.js",
						"js/view.js",
						"js/email.js",
						"js/entities.js",
						"js/board.js",
						"js/cursor.js",
						"js/levelLoader.js",
						"js/vimgame.js",
						"js/input.js",
						"js/screen.game-screen.js"
					],
					complete:function() {
						vim.game.showScreen("splash-screen");
						g()
					} 
				} ])
			} else {
				Modernizr.load([ {
				load:["js/allinone.js"],complete:function() {
					vim.game.showScreen("splash-screen");
					g()
				} 
				} ])
			} 
		} 
		function h() {
			if (e===d) {
				return 1
			} return d===0 ? 0 : e/d
		} 
		return {
			initialLoad:a,
			getProgress:h
		} 
	} ()
);

if(window.addEventListener) {
	window.addEventListener("load",vim.loader.initialLoad,false)
} else {
	if (window.attachEvent) {
		window.attachEvent("onload",function() {
			document.getElementById("game-menu").style.display = "none";
			document.getElementById("no-canvas").style.display = "block";
			document.getElementById("game-screen").style.display = "block"
		} )
	} 
};

