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
	initialize: function(chara, type) {
		enchant.Group.call(this);
		this.chara = chara;
		this.type = type;
		this.width = 192;
		this.height = 96;

		this.setBasePoint(chara.x, chara.y);
		this.drawBackground(GAME.assets[CONFIG.get(["Menu", "base"])]);

		this.setName();
		this.setLevel();
		this.setSchool();
		//if (this.type == CONSTS.side("PLAYER")) {
			this.setHpStat();
			this.setMpStat();
			this.setExpStat();
		//}
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
	change: function(attr) {
		this.hp_stat.value = attr.hp;
	},
	syncHp: function() {
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
		this.name = new Label(this.chara.cur_attr.name);
		this.name.color = '#ffffff';
		this.name.moveTo(10, 5);
		this.addChild(this.name);
	},
	setLevel: function() {
		this.level = new Label("Lv. " + this.chara.cur_attr.level);
		this.level.color = '#ffffff';
		this.level.moveTo(60, 5);
		this.addChild(this.level);
	},
	setSchool: function() {
		this.school = new Label(this.chara.cur_attr.school);
		this.school.color = '#ffffff';
		this.school.moveTo(130, 5);
		this.addChild(this.school);
	},
	setHpStat: function() {
		var bl = 32
		// image
		this.hp_img = new Sprite(24, 24);
		this.hp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "hp"])];
		this.hp_img.moveTo(10, bl - 5);
		this.addChild(this.hp_img);
		// bar & lable
		this.hp_stat = new TextBar(130, 8, 
			this.chara.cur_attr.hp, 
			this.chara.master_attr.hp
		);

		this.hp_stat.bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "hp"])];
		this.hp_stat.moveTo(45, bl - 5);

		this.addChild(this.hp_stat);
	},
	setMpStat: function() {
		var bl = 57;
		// image
		this.mp_img = new Sprite(24, 24);
		this.mp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "mp"])];
		this.mp_img.moveTo(10, bl - 5);
		this.addChild(this.mp_img);
		// bar & lable
		this.mp_stat = new TextBar(130, 8, 
			this.chara.cur_attr.mp, 
			this.chara.master_attr.mp
		);

		this.mp_stat.bar.image = GAME.assets[CONFIG.get(["Menu", "bar", "mp"])];
		this.mp_stat.moveTo(45, bl - 5);

		this.addChild(this.mp_stat);
	},
	setExpStat: function() {
		//this.exp_img = new Sprite(24, 24);
		//this.exp_img.image = GAME.assets[CONFIG.get(["Menu", "icon", "exp"])];
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
var TextBar = enchant.Class.create(enchant.Group, {
	initialize: function(w, h, curVal, maxVal) {
        enchant.Group.call(this);
		this.bar = new Bar(w, h, w, curVal, maxVal);
		this.bar.moveTo(10, 5);

		this.label = new Label(Math.round(curVal) + " / " + Math.round(maxVal));
		this.label.color = '#ffffff';
		this.label.textAlign = 'right';
		this.label.width = w - 40;
		this.label.font = '14pt Helvetica';
		this.label.moveTo(20, 0);
		// move label to the middle of the bar

		this.addChild(this.bar);
		this.addChild(this.label);

		this.addEventListener('enterframe', function() {
			this.label.text = Math.round(this.bar.curvalue) + 
				" / " + Math.round(this.bar.maxvalue);
		});
	}
});

var Bar = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h, maxwidth, curVal, maxVal) {
        enchant.Sprite.call(this, w, h);
        this.image = new enchant.Surface(w, h);// Null用
        this.image.context.fillColor = 'RGB(0, 0, 256)';
        this.image.context.fillRect(0, 0, w, h);
        this._direction = 'right';
        this._origin = 0;
        this._maxvalue = maxVal;
        this._lastvalue = curVal;
        this.value = curVal;
        this.easing = 5;
		this._maxwidth = maxwidth;
        this.addEventListener('enterframe', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            this._lastvalue += (this.value - this._lastvalue) / this.easing;
            if (Math.abs(this._lastvalue - this.value) < 1.3) {
                this._lastvalue = this.value;
            }
            this.width = Math.round((this._lastvalue / this._maxvalue) * this._maxwidth) | 0;
            if (this.width > this._maxwidth) {
                this.width = this._maxwidth;
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
    },
	// readonly 
	// returns current value
	curvalue: {
		get: function() {
			return this._lastvalue;
		},
		set: function(val) {
			this._lastvalue = val;
		},
	}
});


