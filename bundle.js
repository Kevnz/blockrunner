(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//We use window.game because we want it to be accessible from everywhere

var tile = 16;
var width = 32 * 16;
var height = 16 * 16;
window.game = new Phaser.Game(width, height, Phaser.AUTO);
game.globals = {
    //Add variables here that you want to access globally
    //score: 0 could be accessed as game.globals.score for example
    TILE_SIZE: 16,
    WIDTH: 32,
    HEIGHT: 16,
    LEVEL: 'level-1',
    SCORE: 0
};



game.state.add('level1', require('./states/play.js'));
game.state.add('level2', require('./states/play.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.start('boot');

},{"./states/boot.js":3,"./states/load.js":4,"./states/menu.js":5,"./states/play.js":6}],2:[function(require,module,exports){
var bulletTime = 0;
var playerSpeed =  50;
var bulletSpeed =  160;

function hasTouch() {
    return (('ontouchstart' in window) ||       // html5 browsers
            (navigator.maxTouchPoints > 0) ||   // future IE
            (navigator.msMaxTouchPoints > 0));  // current IE10
}

var Player = function (game) {
    var self = this;
	this.game = game;

	this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
	this.sprite.name = 'player-dude';
	this.sprite.animations.add('left', [0], 10, true);
	this.sprite.animations.add('down', [1], 10, true);
	this.sprite.animations.add('right', [2], 10, true);
	this.sprite.animations.add('up', [3], 10, true);
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);  

    game.input.gamepad.start();

    if (hasTouch()) {
        GameController.init( {
            left: {
                type: 'joystick',
                position: { left: '15%', bottom: '15%' },
                joystick: {
                    touchMove: function( details ) {
                        var x = details.normalizedX;
                        var y = details.normalizedY;
                        var lessThanX = 1;
                        var lessThanY = 1;
                        if (x < 0) {
                            x = x * -1;
                            lessThanX = -1;
                        }
                        if (y < 0) {
                            y = y * -1;
                            lessThanY = -1;
                        }
                        if ( x > y ) {
                            console.log('x>y');
                            console.log(lessThanX)
                            self.sprite.body.velocity.x = lessThanX * playerSpeed;
                            if (lessThanX < 0) {
                                self.sprite.animations.play('left'); 
                            } else { 
                                self.sprite.animations.play('right');
                            }
                        }
                        if (x < y) {
                            self.sprite.body.velocity.y = (-1*lessThanY) * playerSpeed;;
                             
                            //this.sprite.animations.play('down');

                            if (lessThanY < 0) {
                                self.sprite.animations.play('down'); 
                            } else { 
                                self.sprite.animations.play('up');
                            }
                        } 
                    }
                }
            },
            right: {
                type: 'joystick',
                position: { right: '15%', bottom: '15%' } ,
                joystick: {
                    touchMove: function( details ) { 
                        var x = details.normalizedX;
                        var y = details.normalizedY;
                        var lessThanX = 1;
                        var lessThanY = 1;
                        if (x < 0) {
                            x = x * -1;
                            lessThanX = -1;
                        }
                        if (y < 0) {
                            y = y * -1;
                            lessThanY = -1;
                        }

                        if (x > y) {
                            self.fireBullet('x', lessThanX*bulletSpeed); 
                        }
                        if (x < y) {
                            self.fireBullet('y', (-1*lessThanY)*bulletSpeed);
                        }
                        //determine if x or y is greater

                        //determine if is pos or negative
                   }
               }
            }
        });
    }
    this.pad = game.input.gamepad.pad1;

    this.bulletTime = 0;
    this.cursors = game.input.keyboard.createCursorKeys();
}

Player.prototype = Object.create({

    setBullets: function (bullets) {
        this.bullets = bullets;
    },
    fireBullet: function  (dir, speed) { 

        //  To avoid them being allowed to fire too fast we set a time limit
        if (this.game.time.now > this.bulletTime) { 
            //  Grab the first bullet we can from the pool
            var bullet = this.bullets.getFirstExists(false); 
            if (bullet) {
                //  And fire it
                bullet.reset(this.sprite.x + 8, this.sprite.y + 10);
                bullet.body.velocity[dir] = speed;
                this.bulletTime = game.time.now + 500;
            }
        }

    },
	create: function () {

	},
	update : function () {
        if (!hasTouch()) {
            this.sprite.body.velocity.x = 0;
            this.sprite.body.velocity.y = 0;
        }

        if(this.cursors.left.isDown) {
            this.sprite.body.velocity.x = -200;
        } else if(this.cursors.right.isDown) {
            this.sprite.body.velocity.x = 200;
        } else if(this.cursors.up.isDown) {
            this.sprite.body.velocity.y = -200;
        } else if(this.cursors.down.isDown) {
            this.sprite.body.velocity.y = 200;
        }



        if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
            this.sprite.body.velocity.x = -1*playerSpeed;
            this.sprite.animations.play('left');
        }
        if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
            this.sprite.body.velocity.x = playerSpeed;
            this.sprite.animations.play('right');
        }
        if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
            this.sprite.body.velocity.y = -1* playerSpeed;;
            this.sprite.animations.play('up');
        }
        if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
            this.sprite.body.velocity.y = playerSpeed;
            this.sprite.animations.play('down');
        }
        //
        if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -0.1) {
            //player.x--;
            this.fireBullet('x', -1*bulletSpeed);
        }
        if (pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) > 0.1) {
            //player.x++;
            this.fireBullet('x', bulletSpeed);
        }
        if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) < -0.1) {
            //player.y--;
            this.fireBullet('y', -1*bulletSpeed);
        }
        if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) > 0.1) {
            //player.y++;
            this.fireBullet('y', bulletSpeed);
        }
	},
    getX: function () {
        return this.sprite.x;
    },
    getY: function () {
        return this.sprite.y;
    }
});

module.exports = Player;
},{}],3:[function(require,module,exports){
module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
        game.load.image('loading', 'assets/loading.png');
        game.load.image('load_progress_bar', 'assets/progress_bar_bg.png');
        game.load.image('load_progress_bar_dark', 'assets/progress_bar_fg.png');
    },

    create: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.state.start('load');
    }
};

},{}],4:[function(require,module,exports){
module.exports = {
    loadingLabel: function () {
        //Here we add a label to let the user know we are loading everything
        //This is the "Loading" phrase in pixel art
        //You can just as easily change it for your own art :)
        this.loading = game.add.sprite(game.world.centerX, game.world.centerY - 20, 'loading');
        this.loading.anchor.setTo(0.5, 0.5);
        //This is the bright blue bar that is hidden by the dark bar
        this.barBg = game.add.sprite(game.world.centerX, game.world.centerY + 40, 'load_progress_bar');
        this.barBg.anchor.setTo(0.5, 0.5);
        //This bar will get cropped by the setPreloadSprite function as the game loads!
        this.bar = game.add.sprite(game.world.centerX - 192, game.world.centerY + 40, 'load_progress_bar_dark');
        this.bar.anchor.setTo(0, 0.5);
        game.load.setPreloadSprite(this.bar);
    },

    preload: function () {
        this.loadingLabel();
        //Add here all the assets that you need to game.load
        game.load.image('badguy', 'assets/badguy.png');
        game.load.spritesheet('player', 'assets/player-sprites.png', 16,16);
        game.load.image('blackbrick', 'assets/blackbrick.png');
        game.load.image('bluebrick', 'assets/bluebrick.png');
        game.load.image('redbrick', 'assets/redbrick.png');
        game.load.image('greenbrick', 'assets/greenbrick.png');
        game.load.image('greybrick', 'assets/greybrick.png');
        game.load.image('whitebrick', 'assets/whitebrick.png');
        game.load.image('gate', 'assets/gate.png');
        game.load.image('lazer', 'assets/lazer_bolt.png');
        game.load.spritesheet('button', 'assets/buttons.png', 248, 64);
        game.load.text('level-1', 'levels/level-1.txt');
        game.load.text('level-2', 'levels/level-2.txt');
    },

    create: function () {
        game.state.start('menu');
    }
};

},{}],5:[function(require,module,exports){
var button;
var half_button_width = 124;
var half_button_height = 32;
var actionOnClick = function () {
	console.log('click');
	game.state.start('level1');
};
var pad_clicked = false; 

module.exports = {
    create: function(){
    //This is just like any other Phaser create function
    //game.state.start('play');

    	button = game.add.button(half_button_width, (game.world.centerY - half_button_height), 'button', actionOnClick, this, 1, 0, 2);


		//button.onInputOver.add(over, this);
		//button.onInputOut.add(out, this);
		//button.onInputUp.add(up, this);

		game.input.gamepad.start();

		pad = game.input.gamepad.pad1;

    },
    update: function(){
    //Game logic goes here
        if (pad.isDown(Phaser.Gamepad.XBOX360_A)) {
    		pad_clicked = true;
    		
    	}

    	if (pad.isUp(Phaser.Gamepad.XBOX360_A) && pad_clicked) {
    		actionOnClick();
    	}
    },
};

},{}],6:[function(require,module,exports){
var player;
var blocks;
var enemies;
var cursors;
var gates;
var pad;
var bullets;
var bulletTime = 0;
var enemyCount = 0;
var bulletSpeed =  160;
var playerSpeed = 50;
var map;
var rdg = new Phaser.RandomDataGenerator();
var badguyBag = [];
var throttle = 0;
var pathfinder;
var scoreboard;

var score = 0;

function randomInt(max) {
	return Math.floor(Math.random() * max);
	return rdg.integerInRange(0, max);
}


var addBadGuy = function (x, y) {
	var enemy = enemies.getFirstExists(false);
	enemy.reset(x * game.globals.TILE_SIZE, y * game.globals.TILE_SIZE);

	badguyBag.push(enemy);
	enemyCount++;
}
var addBrick = function (x,y) {
	var b = blocks.create(x*game.globals.TILE_SIZE, game.globals.TILE_SIZE *(y), 'bluebrick');
	b.body.immovable = true;
    b.name='b-added-x'+x +'-y' + y; 
};
var blasted = function  (bullet, badguy) {

    bullet.kill();
    badguy.kill();
    enemyCount --;
    score = score + 50;
    //window.boom.play();
    //var x = badguy.body.x, y =badguy.body.y
    //var explosion = explosions.getFirstExists(false);
    //explosion.reset(badguy.body.x, badguy.body.y);
    //explosion.play('explode', 30, false, true);
};
 
 
var moveTo = function (actor, target) {


    var actX = (actor.x/game.globals.TILE_SIZE).toFixed();
		var actY = (actor.y/game.globals.TILE_SIZE).toFixed();

    var playX = (player.sprite.x/game.globals.TILE_SIZE).toFixed();
		var playY = (player.sprite.y/game.globals.TILE_SIZE).toFixed()


		findPathTo(actor, actX, actY, playX, playY); 
}

var findPathTo =  function pathTastic (actor, startx, starty, tilex, tiley) {

    pathfinder.setCallbackFunction(function(path) {
        path = path || []; 

	    var move = game.add.tween(actor);

	    // tween through the whole path
	    for (var pathNode in path){

	        // x is pf.js [path.x, path.y] or easystar.js [path.x, path.y]
	        var x = path[pathNode][0]*16 || path[pathNode].x*16,
	            y = path[pathNode][1]*16 || path[pathNode].y*16;

	        move.to({ x: x, y: y }, 300, Phaser.Easing.Linear.None);
	    }
	    if (actor.activeTween != null) {
        	//console.log('activeTween');
        	actor.activeTween.stop();
         // create a new tween
        }
	    actor.activeTween = move;
	    actor.activeTween.start(); 
 
    });
    //console.log([startx, starty], [tilex, tiley])
    pathfinder.preparePathCalculation([Number(startx) , Number(starty)], [Number(tilex) ,Number(tiley)]);
    try {
    	pathfinder.calculatePath();
    } catch (e) {
    	console.log('error');
    	//console.log(e);
    }
    
}


var hunt =  function huntingSeason (badguy) {

    moveTo(badguy, player.sprite);
 
 
 
}

module.exports = {
    create: function(){

        game.physics.startSystem(Phaser.Physics.ARCADE);

    	game.stage.backgroundColor = '#cccccc';

     

    	var Player = require('../entities/player');

    	player = new Player(game);

    	blocks = game.add.group();
    	blocks.enableBody = true;
    	blocks.physicsBodyType = Phaser.Physics.ARCADE;

    	gates = game.add.group();
    	gates.enableBody = true;
    	gates.physicsBodyType = Phaser.Physics.ARCADE;

	    bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;
	    bullets.createMultiple(6, 'lazer');
	    bullets.setAll('anchor.x', 0.5);
	    bullets.setAll('anchor.y', 1);
	    bullets.setAll('outOfBoundsKill', true);
	    bullets.setAll('checkWorldBounds', true);


	    enemies = game.add.group();
	    enemies.enableBody = true;
	    enemies.physicsBodyType = Phaser.Physics.ARCADE;
	    enemies.createMultiple(32, 'badguy');
	    enemies.setAll('outOfBoundsKill', true);
	    enemies.setAll('checkWorldBounds', true);
	    enemies.setAll('bounce', 1);
	    enemies.setAll('body.bounce', 1);

	    player.setBullets(bullets);

    	var l1 = game.cache.getText(game.globals.LEVEL);

    	var rows = l1.split('\r\n'); 
        if (rows.length === 1) {
            rows = l1.split('\n'); 
        }
		map = [];
    	rows.forEach(function (row, index) {
    		var newRow = [];
    		for (var i = 0; i < row.length; i++) {

    			if (row[i] === '#') {
    				addBrick(i,index);
    				newRow.push(1);
    			} else if (row[i] ==='E') {
    				addBadGuy(i, index);
    				newRow.push(0);
    			} else {
    				newRow.push(0);
    			} 

    		};

    		map.push(newRow);
    	});

    	cursors = game.input.keyboard.createCursorKeys();


  		var walkables = [0];

	    pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
	    pathfinder.setGrid(map, walkables);
	    console.log(map);

    	var style = { font: "16px Arial", fill: "#ff0044", align: "center" };

    	scoreboard = game.add.text(5, 0, score.toString(), style);

    	console.log(scoreboard);
    },
    update: function(){
    	
    	game.physics.arcade.collide(enemies, enemies);
    	game.physics.arcade.collide(enemies, blocks, function (enemy, block) {

    		//enemy.body.velocity.x = 0;
    		//enemy.body.velocity.y = 0;
    		//hunt(enemy); 

    	}, null, this);
    	game.physics.arcade.collide(player.sprite, blocks, function () { 

    	}, null, this);
 

    	game.physics.arcade.collide(player.sprite, gates, function () { 

    	}, null, this);
    	//game.physics.arcade.collide(blocks, blocks);
		game.physics.arcade.overlap(bullets, blocks, function (b, block) {

			b.kill();
		}, null, this);
    	game.physics.arcade.overlap(bullets, enemies, blasted, null, this);
    	
    	game.physics.arcade.collide(player.sprite, enemies, function () { 

    	}, null, this);

    	scoreboard.text = score.toString();

    	if ((throttle % 100) === 0 ) {
	 		badguyBag.forEach(function (bad, index){
	 			if((index % 2) === 0) {
	 				hunt(bad);
	 			}
	 		}); 
    	}
     	if ((throttle % 135) === 0 ) {
	 		badguyBag.forEach(function (bad, index) {
	 			if((index % 2) !== 0) {
	 				hunt(bad);
	 			}
	 		});
    	}
    	/*
    	if ((throttle % 140) === 0 ) {
	 		hunt(badguyBag[2]); 
    	}
    	if ((throttle % 160) === 0 ) {
	 		hunt(badguyBag[3]); 
    	}
    	if ((throttle % 180) === 0 ) {
	 		hunt(badguyBag[4]); 
    	}
     	if ((throttle % 230) === 0 ) {
	 		hunt(badguyBag[5]); 
    	}
    	if ((throttle % 250) === 0 ) {
	 		hunt(badguyBag[6]); 
    	}
    	if ((throttle % 270) === 0 ) {
	 		hunt(badguyBag[7]); 
    	}
		*/
    	player.update();
 		throttle++;
    },
};

},{"../entities/player":2}]},{},[1]);
