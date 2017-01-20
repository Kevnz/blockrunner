var bulletTime = 0;
var playerSpeed =  50;
var bulletSpeed =  160;
var cursors;
var EventEmitter2 = require('eventemitter2').EventEmitter2;

function hasTouch() {
  return (('ontouchstart' in window) ||       // html5 browsers
      (navigator.maxTouchPoints > 0) ||   // future IE
      (navigator.msMaxTouchPoints > 0));  // current IE10
}

var Player = function (game) {

  var self = this;
  this.eventstore = new EventEmitter2({

  });
  this.game = game;
  this.lives = 3;
  this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
  this.sprite.name = 'player-dude';
  this.sprite.animations.add('left', [0], 10, true);
  this.sprite.animations.add('down', [1], 10, true);
  this.sprite.animations.add('right', [2], 10, true);
  this.sprite.animations.add('up', [3], 10, true);
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

  game.input.gamepad.start();
  this.lifeIndicators = [];
  this.lifeIndicators.push( game.add.sprite((game.globals.WIDTH *game.globals.TILE_SIZE)-16, 0, 'player-life'));
  this.lifeIndicators.push( game.add.sprite((game.globals.WIDTH *game.globals.TILE_SIZE)-32, 0, 'player-life'));
  //game.bringToTop(this._life2);
  //game.bringToTop(this._life1);
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
              self.sprite.body.velocity.y = (-1*lessThanY) * playerSpeed;

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
           }
         }
      }
    });
  }
  this.pad = game.input.gamepad.pad1;

  this.bulletTime = 0;
  cursors = game.input.keyboard.createCursorKeys();
}

Player.prototype = Object.create({

  setBullets: function (bullets) {
    this.bullets = bullets;
  },
  on: function (event, callback) {
    this.eventstore.on(event, callback);
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
  respawn: function () {
    this.sprite.x = game.world.centerX;
    this.sprite.y = game.world.centerY;
    this.respawning = true;
    var flash = game.add.tween(this.sprite)
    flash.to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 2, true);
    flash.onComplete.add(function () {
      this.respawning = false;
    }, this);
    flash.onStart.add(function () {

    })
  },
  die: function () {
    this.lives--;
    if (this.lives > 0) {
      var ind = this.lifeIndicators.pop();
      ind.kill();
      this.respawn();
    } else {
      this.eventstore.emit('died');
      this.sprite.kill();
    }
  },

  update : function () {
    if (!hasTouch()) {
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
    }

    if(cursors.left.isDown) {
      this.sprite.body.velocity.x = -200;
    } else if(cursors.right.isDown) {
      this.sprite.body.velocity.x = 200;
    } else if(cursors.up.isDown) {
      this.sprite.body.velocity.y = -200;
    } else if(cursors.down.isDown) {
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
