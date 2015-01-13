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