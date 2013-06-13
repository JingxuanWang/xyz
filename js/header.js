enchant();

var GAME;
var CONFIG;
var CONSTS;

// make functions called in assigned scope
// which means binding 'this' variable 
// when function is called
function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	};
}

