enchant();

var GAME;
var CONFIG;
var CONSTS;
var BATTLE;
var MAP;

// make functions called in assigned scope
// which means binding 'this' variable 
// when function is called
function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	};
}
function sortBy(prop, order) {
    return function(a, b) {
        return order * (a[prop] - b[prop]);
    };  
}
function clone(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = {};
	//var temp = obj.constructor(); // changed

	for(var key in obj)
		temp[key] = clone(obj[key]);
	return temp;
}
