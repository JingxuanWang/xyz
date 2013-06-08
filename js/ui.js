var MoveShade = enchant.Class.create(enchant.Sprite, {
	classname: "MoveShade",
	initialize: function(grid, width, height, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		this.image = GAME.assets[CONFIG.get(["UI", "mov_base"])];
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});

	},
	_noop: function() {}	
});

var AttackShade = enchant.Class.create(enchant.Sprite, {
	classname: "AttackShade",
	initialize: function(grid, width, height, type, callback) {
		enchant.Sprite.call(this, width, height);
		this.moveTo(grid.x, grid.y);
		if (type === "ATK") {
			this.image = GAME.assets[CONFIG.get(["UI", "atk_base"])];
			//this.image = GAME.assets[CONFIG.get(["UI", "mov_base"])];
		} else {
			this.image = GAME.assets[CONFIG.get(["UI", "ar"])];
		}
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			callback.call(this, grid);
		});
	},

	_noop: function() {}	
});

// containts button & label & image
var Menu = enchant.Class.create(enchant.Group, {
	classname: "Menu",
	buttons: ["atk", "mov"],
	initialize: function(x, y, chara, cb_list) {
		this.drawBackround();
		for (var i = 0; i < buttons.length; i ++) {
			var type = buttons[i];
			var cb = cb_list[type];
			addButton(x, y, w, h, type, cb);
		}
	},
	drawBackground: function() {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	addButton: function(type, cb) {
		var button = new Button(x, y, w, h, type, cb);
		this.addChild(button);
	},
	_noop: function() {}	
});


// a button contains a image and a lable
var Button = enchant.Class.create(enchant.Group, {
	classname: "Button",
	initialize: function(x, y, image, text, cb) {
		enchant.Group.call(this, w, h);
		this.addLabel(text);
		this.moveTo(x, y);
		this.width = 40;
		this.height = 40;
		this.drawBackground();

		if (type == "atk") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_atk"])]);
		} else if (type == "mov") {
			addLabel(type);	
			addImage(GAME.assets[CONFIG.get(["UI", "img_menu_mov"])]);
		} else {
			console.log("invalide type");
		}

		this._pressed = false;
		this.addEventListener(enchant.Event.TOUCH_START, function() {
			this._pressed = true;
			this.y++;
			this.changeStyle();
			callback.call();
		});
		this.addEventListener(enchant.Event.TOUCH_END, function() {
			this._pressed = false;
			this.y--;
			this.changeStyle();
			callback.call();
		});
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	changeStyle: function() {
		// currently only the background
		if (this._pressed === true) {
			this.bg.image.context.fillStyle = '#fff';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		} else {
			this.bg.image.context.fillStyle = '#333';
			this.bg.image.context.fillRect(0, 0, this.width, this.height);
		}
	},
	addImage: function(image) {
		// fixed width/height
		var img = new Sprite(32, 32);
		img.image = image;
		img.moveTo(2, 2);
		this.img = img;
		this.addChild(img);
	},
	addLabel: function(text) {
		var lb = new Label(text);
		lb.moveTo(36, 2);
		this.lb = lb;
		this.addChild(lb); 
	},
	_noop: function() {}	

});

// contains hp/mp bar & label & image
var InfoBox = enchant.Class.create(enchant.Group, {
	classname: "InfoBox",
	initialize: function(x, y, chara, type) {
		enchant.Group.call(this, w, h);
		this.chara = chara;
		this.type = type;
	
		this.setBasePoint(chara.x, chara.y);	
		this.drawBackground(CONFIG.get(["Menu", "base"]));

		this.setName();
		this.setSchool();
		if (this.type == CONSTS.side("PLAYER")) {
			this.setHpStat();
			this.setMpStat();
			this.setExpStat();
		}
	},
	chara: {
		get: function() {
			return this._chara;
		},
		set: function(chara) {
			this._chara = chara;
		}
	},
	type: {
		get: function() {
			return this._type;
		},
		set: function(type) {
			this._type = type;
		}
	},
	change: function(hp, mp, exp, atk, def) {
		this.hp_bar.value = hp;
		this.mp_bar.value = mp;
		this.exp_bar.value = exp;
	},
	drawBackground: function(image) {
		var bg = new Sprite(this.width, this.height);
		if (image) {
			bg.image = image;
		} else {
			bg.image.context.fillStyle = '#fff';
			bg.image.context.fillRect(0, 0, this.width, this.height);
		}
		this.bg = bg;
		this.addChild(bg);
	},
	setBasePoint: function(x, y) {
		if (x >= CONFIG.get(["system", "width"]) / 2) {
			this.x = x - 4 * CONFIG.get(["map", "tileWidth"]);
		} else {
			this.x = x + CONFIG.get(["map", "tileWidth"]);
		}
		if (y >= CONFIG.get(["system", "height"]) / 2) {
			if (this._type === 1 && this._style === 0) {
				this.y = y - 2 * CONFIG.get(["map", "tileHeight"]);
			} else {
				this.y = y - CONFIG.get(["map", "tileHeight"]);
			}
		} else {
			this.y = y;
		}
	},
	setName: function() {
		this.name = new Label(chara.curAttr.name);
		this.name.moveTo(4, 4);
		this.addChild(this.name);
	},
	setSchool: function() {
		this.school = new Label(chara.curAttr.school);
		this.school.moveTo(4, 30);
		this.addChild(this.school);
	},
	setLv: function() {
	},
	setHpStat: function() {
		// image + bar + lable
		// image
		this.hp_img = new Sprite(32, 32);
		this.hp_bar = new Bar(20, 100);
		this.hp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "hp"])];
		this.hp_bar.maxvalue = chara.masterAttr.hp;
		this.hp_bar.value = chara.curAttr.hp;
	},
	setMpStat: function() {
		this.mp_bar = new Bar(20, 100);
		this.mp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "mp"])];
		this.mp_bar.maxvalue = chara.masterAttr.mp;
		this.mp_bar.value = chara.curAttr.mp;
	},
	setExpStat: function() {
		this.exp_bar = new Bar(20, 100);
		this.exp_bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "exp"])];
		this.exp_bar.maxvalue = chara.masterAttr.exp;
		this.exp_bar.value = chara.curAttr.exp;
	},

	_noop: function() {}	
});

/*
   // Bar
	var bar = new Bar(20, 100);
	bar.image = game.assets["bar.png"];
	bar.maxvalue = 200;
	bar.value = 0;
	bar.on("enterframe", function() {
		if (this.age % 60 == 0) {
			this.value = Math.random() * 200;
		}   
	}); 
	game.rootScene.addChild(bar);
*/
var Bar = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 1, 16);
        this.image = new enchant.Surface(1, 16);// Null用
        this.image.context.fillColor = 'RGB(0, 0, 256)';
        this.image.context.fillRect(0, 0, 1, 16);
        this._direction = 'right';
        this._origin = 0;
        this._maxvalue = enchant.Game.instance.width;
        this._lastvalue = 0;
        this.value = 0;
        this.easing = 5;
        switch (arguments.length) {
            case 2:
                this.y = y;
                this.x = x;
                this._origin = x;
                break;
            case 1:
                this.x = x;
                this._origin = x;
                break;
            default:
                break;
        }
        this.addEventListener('enterframe', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            this._lastvalue += (this.value - this._lastvalue) / this.easing;
            if (Math.abs(this._lastvalue - this.value) < 1.3) {
                this._lastvalue = this.value;
            }
            this.width = (this._lastvalue) | 0;
            if (this.width > this._maxvalue) {
                this.width = this._maxvalue;
            }
            if (this._direction === 'left') {
                this._x = this._origin - this.width;
            } else {
                this._x = this._origin;
            }
            this._updateCoordinate();
        });
    },
    direction: {
        get: function() {
            return this._direction;
        },
        set: function(newdirection) {
            if (newdirection !== 'right' && newdirection !== 'left') {
                // ignore
            } else {
                this._direction = newdirection;
            }
        }
    },
    x: {
        get: function() {
            return this._origin;
        },
        set: function(x) {
            this._x = x;
            this._origin = x;
            this._dirty = true;
        }
    },
    maxvalue: {
        get: function() {
            return this._maxvalue;
        },
        set: function(val) {
            this._maxvalue = val;
        }
    }
});


