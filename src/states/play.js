var player;
var blocks;
var enemies;
var powerups;
var people;
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

var powerupCount = 0;
var peopleCount = 0;
var score = 0;
var DataBase =  require('../utils/storage');
var db; 
var scoreDB;      
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
var addPerson = function (x,y) {
    var b = people.create(x*game.globals.TILE_SIZE, game.globals.TILE_SIZE *(y), 'person');
    //b.body.immovable = true;
    b.name='person-added-x'+x +'-y' + y; 
    peopleCount++;

};
var addPowerup = function (x,y) {
    var b = powerups.create(x*game.globals.TILE_SIZE, game.globals.TILE_SIZE *(y), 'powerup');
    b.body.immovable = true;
    b.name='powerup-added-x'+x +'-y' + y; 
    powerupCount++;
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


var moveToPoint = function (actor, target) {
    var actX = (actor.x/game.globals.TILE_SIZE).toFixed();
    var actY = (actor.y/game.globals.TILE_SIZE).toFixed();

    findPathTo(actor, actX, actY, target.x, target.y);
 


}
var findPathTo =  function pathTastic (actor, startx, starty, tilex, tiley) { 
    pathfinder.setCallbackFunction(function(path) {
        path = path || []; 

        var move = game.add.tween(actor);
            move.from({ x: actor.x, y: actor.y }, 300, Phaser.Easing.Linear.None);
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
    
    try {
        pathfinder.preparePathCalculation([Number(startx) , Number(starty)], [Number(tilex) ,Number(tiley)]);
        pathfinder.calculatePath();
    } catch (e) {
        console.log('error');
        actor.tint =  Math.random() * 0xffffff;
        //console.log(e);
    }
    
};

var isClose = function (point1, point2) {
    var point1X = (point1.x/game.globals.TILE_SIZE).toFixed();
    var point1Y = (point1.y/game.globals.TILE_SIZE).toFixed();

    var point2X = (point2.x/game.globals.TILE_SIZE).toFixed();
    var point2Y = (point2.y/game.globals.TILE_SIZE).toFixed();

    var diffX = Math.abs(point1X - point2X);
    var diffY = Math.abs(point1Y - point2Y); 
    return (diffY < 6) && (diffX < 6);
};

var canGo = function (actor, dir) {
    return  actor.x+dir.x >= 0 &&
            actor.x+dir.x <= game.globals.WIDTH - 1 &&
            actor.y+dir.y >= 0 &&
            actor.y+dir.y <= game.globals.HEIGHT - 1 &&
            map[actor.y+dir.y][actor.x +dir.x] != '#';
}

var isClearSpot = function (spot) {
    if(spot.x >= game.globals.WIDTH || spot.y >= game.globals.HEIGHT) {
        return false;
    }
    if( !map  ) { 
        return false;
    }
    if (!map[spot.x] ) { 
        return false
    }
    if(!map[spot.x][spot.y] ) { 
        return false;
    }
    return map[spot.x][spot.y] != '#';
};
var getRandomSpot = function (x,y) { 
    var xN = Number(x);
    var yN = Number(y);
    var RANGE = 3;
    return {
        x:game.rnd.integerInRange(Number(xN - RANGE), Number(xN + RANGE)),
        y:game.rnd.integerInRange(Number(yN - RANGE), Number(yN + RANGE))
    };
};

var getOpenSpot = function (actor) {

    var actX = (actor.x/game.globals.TILE_SIZE).toFixed();
    var actY = (actor.y/game.globals.TILE_SIZE).toFixed();

    var spot = getRandomSpot(actX, actY);
    
    console.log(spot);
    if (isClearSpot(spot)) {
        return spot;
    }
    return false;
    //hunt(actor);
}


var hunt =  function huntingSeason (badguy) {

    var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];    

    var point1X = (badguy.x/game.globals.TILE_SIZE).toFixed();
    var point1Y = (badguy.y/game.globals.TILE_SIZE).toFixed();

    var point2X = (player.sprite.x/game.globals.TILE_SIZE).toFixed();
    var point2Y = (player.sprite.y/game.globals.TILE_SIZE).toFixed();

    var diffX = Math.abs(point1X - point2X);
    var diffY = Math.abs(point1Y - point2Y);

    if (isClose(badguy, player.sprite)){
        moveTo(badguy, player.sprite);
    } else {
        var spot = getOpenSpot(badguy);
        if (spot == null) return;
        moveToPoint(badguy, spot); 
    }
}

module.exports = {
    create: function(){
        db = new DataBase('levels');
        scoreDB = new DataBase('scores');

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.stage.backgroundColor = '#cccccc';

        blocks = game.add.group();
        blocks.enableBody = true;
        blocks.physicsBodyType = Phaser.Physics.ARCADE;

        people = game.add.group();
        people.enableBody = true;
        people.physicsBodyType = Phaser.Physics.ARCADE;

        powerups = game.add.group();
        powerups.enableBody = true;
        powerups.physicsBodyType = Phaser.Physics.ARCADE;


        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        enemies.createMultiple(32, 'badguy');
        enemies.setAll('outOfBoundsKill', true);
        enemies.setAll('checkWorldBounds', true);
        enemies.setAll('bounce', 1);
        enemies.setAll('body.bounce', 1);


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
                } else if (row[i] ==='P') {
                    addPerson(i, index);
                    newRow.push(0);
                } else if (row[i] ==='B') {
                    addPowerup(i, index);
                    newRow.push(0);
                } else {
                    newRow.push(0);
                } 

            };

            map.push(newRow);
        });
     





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






        var Player = require('../entities/player');

        player = new Player(game);
        player.setBullets(bullets);
        player.on('died', function () {

            console.log('the player is dead');

            scoreDB.saveScore(score);
            game.state.start('dead');

        });





        var walkables = [0];

        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(map, walkables);
        console.log(map);

        var style = { font: "16px Arial", fill: "#ff0044", align: "center" };

        scoreboard = game.add.text(5, 0, score.toString(), style);

        console.log(scoreboard);
        badguyBag.forEach(function (bad, index) {

            game.time.events.loop(800, function () {
                hunt(bad);
            }, this);
        }); 
    },
    update: function(){
        
        game.physics.arcade.collide(enemies, enemies);
        game.physics.arcade.collide(player.sprite, people, function (p, person) {
            score = score+100;
            person.kill();
            peopleCount--;
        });
        game.physics.arcade.collide(player.sprite, powerups, function (p, powerup) {
            score = score+100;
            powerup.kill();
            powerupCount--;

        });
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
            if(!player.respawning) {
                player.die();
            }
            
        }, null, this);

        scoreboard.text = score.toString();
        if (powerupCount === 0 && peopleCount === 0) {
            console.log(game.globals.LEVELNUMBER);
            game.globals.LEVELNUMBER++;
            db.saveLevel(game.globals.LEVELNUMBER);
            game.globals.LEVEL = 'level-'+game.globals.LEVELNUMBER;
            game.state.start(game.globals.LEVEL);
        }
 

        player.update();
        throttle++;
    },
};
