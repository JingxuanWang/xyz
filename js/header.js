enchant();

var GAME;
var CONFIG;
var CONSTS;

function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	}
}

