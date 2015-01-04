var player;
var blocks;
var enemies;
var cursors;
var gates;
var pad;
var bullets;
var bulletTime = 0;
var enemyCount = 0;
var bulletSpeed =  130;
var playerSpeed = 50;
var map;
var rdg = new Phaser.RandomDataGenerator();
var badguyBag = [];
var throttle = 0;


function randomInt(max) {
	return Math.floor(Math.random() * max);
	return rdg.integerInRange(0, max);
}
var fireBullet = function  (dir, speed) { 
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime) { 
        //  Grab the first bullet we can from the pool
        var bullet = bullets.getFirstExists(false); 
        if (bullet) {
            //  And fire it
            bullet.reset(player.x + 8, player.y + 10);
            bullet.body.velocity[dir] = speed;
            bulletTime = game.time.now + 500;
        }
    }

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
    //window.boom.play();
    //var x = badguy.body.x, y =badguy.body.y
    //var explosion = explosions.getFirstExists(false);
    //explosion.reset(badguy.body.x, badguy.body.y);
    //explosion.play('explode', 30, false, true);
};
var canGo = function (actor,dir) {
 
   	//var result = actor.x + dir.x >= 0 && actor.x+dir.x <= game.globals.WIDTH - 1 && actor.y+dir.y >= 0 && actor.y+dir.y <= game.globals.HEIGHT - 1 && map[actor.y+dir.y][actor.x +dir.x] == '.';
   	
    var actX = actor.x/game.globals.TILE_SIZE;
   	var actY = actor.y/game.globals.TILE_SIZE;

   	var newX = actX + dir.x;
   	var newY = actY + dir.y;
 
	if (typeof map[newY] === 'undefined') {
		return false;
	}
	if (typeof map[newY][newX] === 'undefined') {
		return false;
	} 
   	var res = map[newY][newX] === '.';
 
    return res;
}
var inMotion = function (actor) {
	console.log(actor.destination);
	if (typeof actor.destination === 'undefined') {
		console.log('destination undefined');
		return false;
	}
	return (actor.x === actor.destination.x && actor.y === actor.destination.y);
	return false;
}
var moveTo = function (actor, dir) {
		console.log(dir);
        // check if actor can move in the given direction

        if (inMotion(actor)) {
        	console.log('moving')
        	return false;
        }
        if (!canGo(actor, dir)) {
        	console.log('nope, not going that way');
        	return false;
        }

        console.log('moving');
        var goLeft = actor.x < dir.x;
        var goRight = actor.x > dir.x;
        var goUp = actor.y < dir.y;
        var goDown= actor.y > dir.y;
        var willMove = goLeft || goRight || goUp || goDown;

        console.log('goLeft ' + goLeft);
        console.log('goRight ' + goRight);
        console.log('goUp ' + goUp);
        console.log('goDown ' + goDown);

        console.log('willMove ' + willMove);
        
        

        var tween = game.add.tween(actor);

	    //  The object defines the properties to tween.
	    //  In this case it will move to x 600
	    //  The 6000 is the duration in ms - 6000ms = 6 seconds

	    var actX = actor.x/game.globals.TILE_SIZE;
   		var actY = actor.y/game.globals.TILE_SIZE;

   		var newX = (actX + dir.x) * game.globals.TILE_SIZE ;
   		var newY = (actY + dir.y) * game.globals.TILE_SIZE;
   		console.log('new directions');
	    console.log({ x: newX, y:newY });
	    actor.destination = { x: newX, y:newY };
	    tween.to({ x: newX, y:newY }, 800);


	    /*
		tween.to({
			x: [startX, firstBezierPointX, secondBezierPointX, endX],
			y: [startY, firstBezierPointy, secondBezierPointY, endY],
		}, 1000,Phaser.Easing.Quadratic.Out, true).interpolation(function(v, k){
		    return Phaser.Math.bezierInterpolation(v, k);
		});
		*/
	    //  And this starts it going
	    tween.start();

        if (goLeft) {
	    	actor.body.velocity.x = -100;
	    }
	    if (goRight) {
	    	actor.body.velocity.x = 100;
	    }
	    if (goUp) {
	    	actor.body.velocity.y = -100;
	    } 
	    if (goDown) {
	    	actor.body.velocity.y = 100;
	    } 

 		return willMove;
}
var hunt =function (badguy) {
 
	console.log('on the hunt');
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 },{ x: -1, y:1 }, { x:1, y:1 }, { x:1, y: -1 }, { x:-1, y:-1 }  ];
 
    var currentX = (badguy.x / game.globals.TILE_SIZE).toFixed();
    var currentY = (badguy.y / game.globals.TILE_SIZE).toFixed();

 
    var dirToMove = directions[randomInt(directions.length)]
    // if player is far away, walk randomly
 
    var resultOfMove = moveTo(badguy, dirToMove);
 
    while (!moveTo(badguy, directions[randomInt(directions.length)])) {
    	console.log('moveto loop');
    };
    console.log('finished the move');

    badguy.body.velocity.y =0;
    badguy.body.velocity.x=0;
    return;
    if (Math.abs(dx) + Math.abs(dy) > 6) {
    	//while (!moveTo(badguy, directions[randomInt(directions.length)])) { };
    }
            // try to walk in random directions until you succeed once
           
	

    // otherwise walk towards player
    if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                    // left
                    moveTo(badguy, directions[0]);
            } else {
                    // right
                    moveTo(badguy, directions[1]);
            }
    } else {
            if (dy < 0) {
                    // up
                    moveTo(badguy, directions[2]);
            } else {
                    // down
                    moveTo(badguy, directions[3]);
            }
    }
}

module.exports = {
    create: function(){

 
    //This is just like any other Phaser create function

        game.physics.startSystem(Phaser.Physics.ARCADE);

    	game.stage.backgroundColor = '#cccccc';

     

    	player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    	player.name = 'player-dude';

    	game.physics.enable(player, Phaser.Physics.ARCADE);


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

    	var l1 = game.cache.getText('level-1');

    	var rows = l1.split('\r\n'); 
		map = [];
    	rows.forEach(function (row, index) {
    		var newRow = [];
    		for (var i = 0; i < row.length; i++) {

    			if (row[i] === '#') {
    				addBrick(i,index);
    			}
    			if (row[i] ==='E') {
    				addBadGuy(i, index);
    			}
    			newRow.push(row[i]);

    		};

    		map.push(newRow);
    	});

    	cursors = game.input.keyboard.createCursorKeys();

    	 		game.input.gamepad.start();

    	pad = game.input.gamepad.pad1;
 

    },
    update: function(){
    	
    	game.physics.arcade.collide(enemies, enemies);
    	game.physics.arcade.collide(enemies, blocks);
    	game.physics.arcade.collide(player, blocks, function () { 

    	}, null, this);
 

    	game.physics.arcade.collide(player, gates, function () { 

    	}, null, this);
    	//game.physics.arcade.collide(blocks, blocks);

    	game.physics.arcade.overlap(bullets, enemies, blasted, null, this);
    	
    	game.physics.arcade.collide(player, enemies, function () { 

    	}, null, this);




    	if (throttle === 1) {
	 		badguyBag.forEach(function (baddie) {
				 
	 			hunt(baddie)
	 		}); 
    	} 
 
 

	    player.body.velocity.x = 0;
	    player.body.velocity.y = 0;

	    if(cursors.left.isDown) {
	    	player.body.velocity.x = -200;
	    } else if(cursors.right.isDown) {
	    	player.body.velocity.x = 200;
	    } else if(cursors.up.isDown) {
	    	player.body.velocity.y = -200;
	    } else if(cursors.down.isDown) {
	    	player.body.velocity.y = 200;
	    }



        if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
	        player.body.velocity.x = -100;
	    }
	    if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
	        player.body.velocity.x = 100;
	    }
	    if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
	        player.body.velocity.y = -100;;
	    }
	    if (pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
	        player.body.velocity.y = 100;
	    }
	    //
	    if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -0.1) {
	        //player.x--;
	        fireBullet('x', -100);
	    }
	    if (pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) > 0.1) {
	        //player.x++;
	        fireBullet('x', 100);
	    }
	    if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) < -0.1) {
	        //player.y--;
	        fireBullet('y', -100);
	    }
	    if ( pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) > 0.1) {
	        //player.y++;
	        fireBullet('y');
	    }

 		throttle++;
    },
};
