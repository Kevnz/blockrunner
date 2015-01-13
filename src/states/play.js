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
