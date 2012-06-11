var gameRunning = false;
var frameCount = 0;
var map;

function SoundEffect() {};
var se = new SoundEffect();

// a map should be  a two-dimension-array of grids
function initMap(gridSize, x, y) {
	map = new Array();
	var i = 0;
	var j = 0;
	for (i = 0; i * gridSize < y; i ++) {
		map[i] = new Array();
		for (j = 0; j * gridSize < x; j ++) {
			var grid_origin = new Point(i * gridSize, j * gridSize);
			map[i][j] = new Grid(grid_origin, grid_size, grid_image);
		}
	}
};

// too bad performace 
// should use a single map and uv clip
function drawMap(ctx) {
	for (row in map) {
		for (col in map[row]) {
			var g = map[row][col];
			ctx.drawImage(g.getImage(), g.getImgOrigX(), g.getImgOrigY());
		}
	}
};

/*
// set gameObj according to a grid
//GameObject.prototype.setPositionByGrid = function (i, j) {
function setPositionByGrid (obj, i, j) {
	if (grids[i][j]) {
		obj.x = grids[i][j].x;
		obj.y = grids[i][j].y;
		obj.tgtX = grids[i][j].x;
		obj.tgtY = grids[i][j].y;
	}
};

// move gameObj to a grid
function moveToGrid(i, j, gameObj) {
	if (grids[i][j]) {
		gameObj.tgtX = grids[i][j].x;
		gameObj.tgtY = grids[i][j].y;
	}
}

// move gameObj to a grid
function getCurGrid(gameObj) {
	
	
	if (grids[i][j]) {
		gameObj.tgtX = grids[i][j].x;
		gameObj.tgtY = grids[i][j].y;
	}
}


// move gameObj by grids
function moveByGrid(i, j, gameObj) {
	if (grids[i][j]) {
		gameObj.tgtX = grids[i][j].x;
		gameObj.tgtY = grids[i][j].y;
	}
}
*/

//Create images

//Extend GameObject for Mouse
//function Mouse() {};
//Mouse.prototype = new GameObject();

//var mouse = new GameObject(initial_point, grid_size);
//var hero = new Unit(initial_point, grid_size);

var hero = new Chara(data[500001][1]);
hero.setUnit(new Unit(initial_point, grid_size));

//Wait for DOM to load and init game
$(window).ready(function(){ 
	init(); 
});

function init(){
	loadImages();
	loadSoundEffect();

	loadCharaMaster();
	initChara();
	
	initSettings();
	addEventHandlers();
	startGame();
	startFPSCounter();
}

function loadImages() {
	mouse_image.src = "images/static/Heart.png";
	hero_image.src = "images/gif/lvbu.gif";
	grid_image.src = "images/static/Rock.png";
	//Wait for background image to load 
	//and then call gameLoop to draw initial stage
	//mouse_image.onload = function(){gameLoop(); };
}

function loadSoundEffect() {
	//Create sound
	se.click = new Audio("./se/Se00.wav");
	se.cancel = new Audio("./se/Se01.wav");
}

function initSettings() {
	//Get a handle to the 2d context of the canvas
	ctx = document.getElementById('canvas').getContext('2d'); 

	//Calulate screen height and width
	screenWidth = parseInt($("#canvas").attr("width"));
	screenHeight = parseInt($("#canvas").attr("height"));


	alert("Screen : "+screenWidth+" : "+screenHeight);
	
	//init map
	initMap(gridSize, screenWidth, screenHeight);

	//init mouse obj
	//mouse.setImage(mouse_image);	

	//init hero
	hero._unit.setImage(hero_image);	


	$("#MenuLeft").hide();
	$("#MenuRight").hide();
}

//Using jQuery add the event handlers after the DOM is loaded
function addEventHandlers() {
	//add event handler to surrounding DIV 
	//to monitor mouse move and update mouse's x position
	$("#container").mousemove(function(e) {
		//var p = new Point(
		//	e.pageX - mouse.getImage().width/2, 
		//	e.pageY - mouse.getImage().height/2
		//);
		//mouse.setOrigin(p);
	});

	//Add event handler for start button
	$("#BtnImgStart").click(function () {		
		se.click.play();
		toggleGameplay();
		//$("#BtnImgStart").show();
		$("#BtnImgStart").hide();
	});
	
	// click
	$("#container").click(function(e) {
		se.click.play();
		
		var p = new Point(e.pageX, e.pageY);
		// if hero is clicked
		if (hero._unit.isContain(p)) {
			hero._unit.setOrigin(hero._unit.getTarget());
			// pop up menu ui
			$("#MenuLeft").show();
			$("#MenuLeft").css("left", hero._unit.getMidX() - 50 - 18 + 16);
			$("#MenuLeft").css("top", hero._unit.getMidY() - 9);
			$("#MenuRight").css("left", hero._unit.getMidX() + 18 + 50 - 16);
			$("#MenuRight").css("top", hero._unit.getMidY() - 9);
			$("#MenuLeft").show();
			$("#MenuRight").show();
			$("#MenuLeft").appear = 1;
			$("#MenuRight").appear = 1;
		} else {
			hero._unit.setOrigin(hero._unit.getTarget());
		}
	});

	$("#MenuLeft").click(function(e) {
		$("#MenuLeft").hide();
		$("#MenuRight").hide();
		se.cancel.play();
		hero._unit.setTarget(
			new Point(
				hero._unit.getMinX() - 60, 
				hero._unit.getMinY()
			)
		);
	});
	$("#MenuRight").click(function(e) {
		$("#MenuLeft").hide();
		$("#MenuRight").hide();
		se.cancel.play();
		hero._unit.setTarget(initial_point);
		//hero.x = 500;
		//hero.y = 100;
		//hero.tgtX = 500;
		//hero.tgtY = 100;
		//hero.setPositionByGrid(10, 3);
	});


	// on mouse down
	$("#container").mousedown(function(e) {
	});
	
	// on mouse up
	$("#container").mouseup(function(e) {
	
	});

	// on mouse leave
	$("#container").mouseleave(function(e) {
	
	});
}

function startGame() {
	$("#test").html = "hello world";
	//alert("test startGame");	
}	

function startFPSCounter() {
	var start = new Date().getTime(),
		time = 0;
	function instance() {
		time += 1000;
		fps();
		
		var diff = (new Date().getTime() - start) - time;
		window.setTimeout(instance, (1000 - diff));
	}
	window.setTimeout(instance, 1000);

}
//Update the display to show frames per second 
//and reset ready for next count
function fps() {
	$("#fps").html(frameCount + " fps");
	frameCount=0;
}

//Main game loop, it all happens here!
function gameLoop() {  
	//Clear the screen 
	//(i.e. a draw a clear rectangle the size of the screen)
	ctx.clearRect(0, 0, screenWidth, screenHeight);

	//NOTE THAT: The latter item will cover the previous ones

	// if not reach then move
	hero._unit.move();

	//drawMap(ctx);

	//Draw hero
	ctx.drawImage(
		hero._unit.getImage(), 
		hero._unit.getImgOrigX(), 
		hero._unit.getImgOrigY()
	);

	//Draw the mouse
	//ctx.drawImage(mouse.getImage(), mouse.getImgOrigX(), mouse.getImgOrigY());
	
	//increment frame count
	frameCount++;
}

//Start game timer, i.e. setTimeout 
//that calls itself taking into account the
//actual real difference in time. This is better than 
function startGameTimer() {
	var start = new Date().getTime(),
		time = 0;
	function timer() {
		time += 20;
		var diff = (new Date().getTime() - start) - time;
		if(gameRunning) {
			gameLoop();
			window.setTimeout(timer, (20 - diff));
		}
	}
	if(gameRunning) {
		window.setTimeout(timer, 20);
	}
}

//Start/stop the game loop (and more importantly that annoying boinging!)
function toggleGameplay() {
	gameRunning = !gameRunning;
	
	if(gameRunning) {
		//alert("Game Start");
		startGameTimer();
	}
	else {
		//alert("Game Pause");
	}
}

function gameOver() {
	gameRunning = false;
	//alert("Game Over: thanks for playing!");
}

/*
function gq_demo() {
var PLAYGROUND_HEIGHT = 250;
var PLAYGROUND_WIDTH = 700;

$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH});

$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});

$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
	.addSprite("sprite1",{animation: animation1})
.addGroup("groupA")
	.addSprite("sprite2",{animation: animation2}).end()
	.addSprite("sprite3",{animation: animation3})
.addGroup("groupB",{overflow: hidden})
	.addSprite("sprite4",{animation: animation4});

$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
	.addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
	.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
	.addGroup("playerMissileLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
	.addGroup("enemiesMissileLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});
}
*/
