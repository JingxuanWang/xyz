// Map Utilities

var MAP = {};
MAP.X = 10;

function moveTo() {
	// unshift from target stack
	// move one by one
}

function calMovableGrid(map, chara, type) {
	// type: for shader on movable grids
	// 0: for no color
	// 1: blue for ours
	// 2: red for enemy
	// ...

	var i = chara.getI();
	var j = chara.getJ();
	var mov = chara.get("mov");

	// flood movable grids

	var grid = getGrid(i, j);
	grid.mov = 3;
	
	var queue = [];
	queue.push(grid);
	
	var visited = [];
	var movableGrids = [];


	while(queue.length > 0) {
		var t = queue.shift();
		var tg;
		
		// remember where we come from
		tg.stack = t.stack;
		tg.stack.push(t);
		
		if (t.mov > 0) {
			// up
			tg = getGrid(t.i, t.j - 1);
			if (isMovable(tg) && !visited[tg.j * MAP.X + tg.x]) {
				tg.mov = t.mov - 1;
				visited[tg.j * MAP.X + tg.x] = 1;
				queue.push(tg);
				movableGrids[tg.i][tg.j] = tg;
				// change color of that tile
			}
			// down
			tg = getGrid(t.i, t.j + 1);
			if (isMovable(tg) && !visited[tg.j * MAP.X + tg.x]) {
				tg.mov = t.mov - 1;
				visited[tg.j * MAP.X + tg.x] = 1;
				queue.push(tg);
				movableGrids[tg.i][tg.j] = tg;
			}
			// left
			tg = getGrid(t.i - 1, t.j);
			if (isMovable(tg) && !visited[tg.j * MAP.X + tg.x]) {
				tg.mov = t.mov - 1;
				visited[tg.j * MAP.X + tg.x] = 1;
				queue.push(tg);
				movableGrids[tg.i][tg.j] = tg;
			}
			// right
			tg = getGrid(t.i + 1, t.j);
			if (isMovable(tg) && !visited[tg.j * MAP.X + tg.x]) {
				tg.mov = t.mov - 1;
				visited[tg.j * MAP.X + tg.x] = 1;
				queue.push(tg);
				movableGrids[tg.i][tg.j] = tg;
			}
		}
	}
	return movableGrids;
};
