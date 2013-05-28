enchant();

var GAME;
var DOWN = 0;
var RIGHT = 1;
var UP = 2;
var LEFT = 3;

var UNIT_STATUS = {
	// common status
	NORMAL: 0,
	MOVED: 1,
	ACTIONED: 2,
	// extra
	POISON: 11,
		

	// dead
	DEAD: -1,
};
var	BATTLE_STATUS = {
	INIT: 0,
	SCENARIO: 1,
	PLAYER_TURN: 100,
	PLAYER_UNIT_MENU: 101,
	PLAYER_UNIT_SHOW_RNG: 102,
	PLAYER_UNIT_ACTION: 103,
	ENEMY_TURN: 200,
	ENEMY_UNIT_ACTION: 201
};

function bind(func, scope){
	return function(){
		return func.apply(scope, arguments);
	}
}

var Ajax = enchant.Class.create(enchant.EventTarget, {
	_method: 'GET', 
	_params: null, 
	_url: null,
	_request: null, 
	_jsonResponse: null, 

	initialize: function(){
		enchant.EventTarget.call(this);
		this._request = new XMLHttpRequest();
		this._loadedCallBack = bind(this._loaded, this);
	},
	load: function(url, params){
		this._url = url;
		this._params = params;
		this._request.open(this._method, this._url, true);
		this._request.onreadystatechange = bind(this._loaded, this);
		this._request.addEventListener('readystatechange', this._loadedCallback, false);
		this._request.send(this._params);
	},
	_loaded: function(){
		if(this._request.readyState == 4){
			if(this._request.status == 200 || this._request.status == 0){
				this.dispatchEvent(new enchant.Event(enchant.Event.LOAD));
			} else {
				this.dispatchEvent(new enchant.Event(enchant.Event.ERROR));
				throw new Error("Load Error : " + this._url);
			}
		}
	},
	unload: function(){
		this._request.abort();
		this._jsonResponse = null;
		this._request.removeEventListener('readystatechange', this_loadedCallback, false);
	},
	setMethod: function(method){
		this._method = method;
	},
	getResponseText: function(){
		return this._request.responseText;
	},
	getResponseJSON: function(){
		if(!this._jsonResponse){
			this._jsonResponse = JSON.parse(this._request.responseText);
		}
		return this._jsonResponse;
	},
	getURL: function(){
		return this._url;
	}
});

var Config = enchant.Class.create({
	initialize: function(){
		this._directions = {
			DOWN: 0,
			RIGHT: 1,
			UP: 2,
			LEFT: 3,
		};
		this._unit_status = {
			// common status
			NORMAL: 0,
			MOVED: 1,
			ACTIONED: 2,
			// extra
			POISON: 11,
				
			// dead
			DEAD: -1,
		};
		this._battle_status = {
			INIT: 0,
			SCENARIO: 1,
			PLAYER_TURN: 100,
			PLAYER_UNIT_MENU: 101,
			PLAYER_UNIT_SHOW_RNG: 102,
			PLAYER_UNIT_ACTION: 103,
			ENEMY_TURN: 200,
			ENEMY_UNIT_ACTION: 201
		};
		//this.load();
	},
	load: function(callback) {
		var self = this;
		var ajax = new Ajax();
		ajax.addEventListener(enchant.Event.LOAD, function() {
			self._all = ajax.getResponseJSON();
			self._text = ajax.getResponseText();
			console.log("load completed" + self.images());
			callback.call();
		});
		ajax.load('js/data.json');
	},
	direction: function(d) {
		return this._directions[d];
	},
	common: function() {
		return;	
	},
	images: function() {
		return this._all.image;
	},
	map: function() {
	},
	// ajax utilities
	_noop: function() {}
});

