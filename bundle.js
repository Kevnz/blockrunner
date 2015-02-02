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
    LEVELNUMBER: 1,
    SCORE: 0
};



game.state.add('level-1', require('./states/play.js'));
game.state.add('level-2', require('./states/play.js'));
game.state.add('level-3', require('./states/play.js'));
game.state.add('level-4', require('./states/play.js'));
game.state.add('level-5', require('./states/play.js'));
game.state.add('level-6', require('./states/play.js'));
game.state.add('end', require('./states/end.js'));
game.state.add('dead', require('./states/dead.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.add('transition', require('./states/transition.js'));
game.state.add('intro', require('./states/intro.js'));
game.state.start('boot');

},{"./states/boot.js":4,"./states/dead.js":5,"./states/end.js":6,"./states/intro.js":7,"./states/load.js":8,"./states/menu.js":9,"./states/play.js":10,"./states/transition.js":11}],2:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {

      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {

      if (!this._all &&
        !this._events.error &&
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || !!this._all;
    }
    else {
      return !!this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {

    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;

        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if(!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.EventEmitter2 = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],3:[function(require,module,exports){
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
    console.log(this.eventstore);
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
        console.log('respawning');
        var flash = game.add.tween(this.sprite)
        flash.to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 2, true);
        flash.onComplete.add(function () { 
            this.respawning = false;
            console.log('this is onComplete');
        }, this);
        flash.onStart.add(function () {
            console.log('start up');
        })
  
        console.log('started the flash');
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
},{"eventemitter2":2}],4:[function(require,module,exports){
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
        game.load.bitmapFont('bits-1', 'assets/fonts/bits1.png', 'assets/fonts/bits1.fnt');
    },

    create: function () {
        game.stage.backgroundColor = '#cccccc';
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.state.start('intro');
    }
};

},{}],5:[function(require,module,exports){
module.exports = {
    init: function () {
        
    },

    preload: function () { 
    },

    create: function () { 
        game.add.bitmapText(25, 85, 'bits-1', 'You Died - The End', 32);
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
            game.state.start('menu');
        }, this);
    },
    update:function () {

    }
};
},{}],6:[function(require,module,exports){
var DataBase =  require('../utils/storage');
var scoreDB;    

module.exports = {
    init: function () {
        
    },

    preload: function () { 
    },

    create: function () { 
        game.add.bitmapText(25, 85, 'bits-1', 'You Won - The End', 32);
        mixpanel.track("Game Won");
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
            game.state.start('menu');
        }, this);

    },
    update:function () {

    }
};

},{"../utils/storage":12}],7:[function(require,module,exports){
module.exports = {
    init: function () {
        
    },

    preload: function () { 
    },

    create: function () { 
        var intro = game.add.bitmapText(game.world.centerX, game.world.centerY, 'bits-1', 'Blockrunner', 32);
        var width = intro.width;
        var height = intro.height;

        intro.x = game.world.centerX - width/2;
        intro.y = game.world.centerY - height/2;
  		game.time.events.loop(Phaser.Timer.SECOND/3, function () {
  			intro.tint =  Math.random() * 0xffffff;
  		}, this);
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
			game.state.start('load');
        }, this);

    },
    update:function () {

    }
};
},{}],8:[function(require,module,exports){
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
        game.load.image('person', 'assets/person.png');
        game.load.image('powerup', 'assets/power.png');
        game.load.image('player-life', 'assets/player-middle.png');
        game.load.spritesheet('button', 'assets/buttons.png', 248, 64);
        game.load.bitmapFont('bits-0', 'assets/fonts/bits0.png', 'assets/fonts/bits0.fnt');
        
        game.load.bitmapFont('bits-2', 'assets/fonts/bits2.png', 'assets/fonts/bits2.fnt');
        game.load.text('level-1', 'levels/level-1.txt');
        game.load.text('level-2', 'levels/level-2.txt');
        game.load.text('level-3', 'levels/level-3.txt');
        game.load.text('level-4', 'levels/level-4.txt');
        game.load.text('level-5', 'levels/level-5.txt');
        game.load.text('level-6', 'levels/level-6.txt');
    },

    create: function () {
        game.state.start('menu');
    }
};

},{}],9:[function(require,module,exports){
var button;
var half_button_width = 124;
var half_button_height = 32;
var actionOnClick = function (levelButton) {
    console.log(levelButton.levelSelect);
    var levelNumber = levelButton.text.split(' ')[1];
    var level = levels.filter(function (item) {
        console.log(item);
        return  levelNumber == item.level;
    });
    if(level.length === 0) return;
	console.log(level);
    console.log(levelButton);
    console.log(levelButton.text);
    console.log('level-' + level[0].level);
    game.globals.LEVELNUMBER =level[0].level;
    game.globals.LEVEL = 'level-' + level[0].level;
	game.state.start('level-' + level[0].level);
};
var pad_clicked = false; 
var levels;
var over = function (levelText) {

    levelText.tint = 0xF9FE99;
    levelText.x = levelText.x+2;
    levelText.y = levelText.y+2;
};
var out = function (levelText) {
    levelText.tint = 0xFFFFFF;
    levelText.x = levelText.x-2;
    levelText.y = levelText.y-2;
}

var addLevelButton = function (text, x, y) {
    var lb = game.add.bitmapText(x, y, 'bits-0','Level ' + text,32);
    lb.inputEnabled = true;
    lb.levelSelect = text
    lb.events.onInputOver.add(over, this);
    lb.events.onInputOut.add(out, this); 
    lb.events.onInputDown.add(actionOnClick, this); 
}
module.exports = {
    create: function(){
    //This is just like any other Phaser create function
    //game.state.start('play');

    	//button = game.add.button(half_button_width, (game.world.centerY - half_button_height), 'button', actionOnClick, this, 1, 0, 2);
        var DataBase = require('../utils/storage');
        var db = new DataBase('levels');
 
        levels = db.getAllLevelsCleared();
        console.log(levels)
        addLevelButton('1',32,16);
        addLevelButton('2',32*6,16);
        addLevelButton('3',32*12,16);
        addLevelButton('4',32,16*5);
        addLevelButton('5',32*6,16*5);
        addLevelButton('6',32*12,16*5);
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

},{"../utils/storage":12}],10:[function(require,module,exports){
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
    console.log(arguments);
    findPathTo(actor, actX, actY, target.x, target.y);
 


}
var findPathTo =  function pathTastic (actor, startx, starty, tilex, tiley) { 
    console.log(arguments);
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
    var startCalcs = [Number(startx) , Number(starty)],  endCalcs = [Number(tilex) , Number(tiley)];
    try {
        pathfinder.preparePathCalculation(startCalcs, endCalcs);
        pathfinder.calculatePath();
    } catch (e) {
        console.log('error');
        actor.tint =  Math.random() * 0xffffff;
        //console.log(e);
        //console.log(startCalcs);
        //console.log(endCalcs);
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
    var RANGE = 5;
    var minX = xN - RANGE < 1 ? 2 : xN - RANGE;
    var maxX = xN + RANGE > 30 ? 30 :  xN + RANGE;
    var minY = yN - RANGE < 1 ? 2 : yN - RANGE;
    var maxY = yN + RANGE > 14 ? 14 :  yN + RANGE;
    var obj = {
        x:game.rnd.integerInRange(minX, maxX),
        y:game.rnd.integerInRange(minY, maxY)
    };
    console.log(obj);
    return obj;
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
        //this is fugly
        if (spot === false) {
            spot = getOpenSpot(badguy);
        }
        if (spot === false) {
            spot = getOpenSpot(badguy);
        }
        if (spot === false) {
            spot = getOpenSpot(badguy);
        }
        if (spot === false) {
            return;
        }
        moveToPoint(badguy, spot); 
    }
}

module.exports = {
    create: function(){
        mixpanel.track("Level played");
        db = new DataBase('levels');
        scoreDB = new DataBase('scores');

        game.physics.startSystem(Phaser.Physics.ARCADE);

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
            mixpanel.track("Level cleared");
            game.state.start('transition');
        }
 

        player.update();
        throttle++;
    },
};

},{"../entities/player":3,"../utils/storage":12}],11:[function(require,module,exports){
module.exports = {
    init: function () {
        
    },

    preload: function () { 
    },

    create: function () { 
        var intro = game.add.bitmapText(game.world.centerX, game.world.centerY, 'bits-1', 'Level Cleared', 32);
        var width = intro.width;
        var height = intro.height;

        intro.x = game.world.centerX - width/2;
        intro.y = game.world.centerY - height/2;
  		game.time.events.loop(Phaser.Timer.SECOND/3, function () {
  			intro.tint =  Math.random() * 0xffffff;
  		}, this);
  		game.time.events.add(Phaser.Timer.SECOND* 2, function () {
  			intro.text = "Next Level";
  			var nwidth = intro.width;
        	var nheight = intro.height;
        	intro.x = game.world.centerX - nwidth/2;
        	intro.y = game.world.centerY - nheight/2;
  		}, this);
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
			game.state.start(game.globals.LEVEL);
        }, this);

    },
    update:function () {

    }
};
},{}],12:[function(require,module,exports){
//var depot = require('depot');
 
var self;

var DataBase = function (collection) {
	self=this;

	this.db = depot(collection);
	console.log(this.db);


}

DataBase.prototype.getAllLevelsCleared = function (callback) {
	var self = this;
	var defaultLevel = {level:1, unlocked:Date.now()};
	var levels = this.db.all();

	console.log(levels);

	if (levels.length === 0) {
		this.db.save(defaultLevel);
		levels.push(defaultLevel);
	}

	return levels;
 
};

DataBase.prototype.saveLevel = function(level) {
	
	this.db.save({level:level, unlocked:Date.now()});
};

DataBase.prototype.getTopScores = function () {
	var scores = this.db.all();

	scores.sort(function (score1, score2) {
		return score1.score >= score2.score ? 1: -1;
	});

	return scores.slice(0,9);
}

DataBase.prototype.saveScore = function (score) {
	this.db.save({score:score, recorded:Date.now()});
};

module.exports = DataBase;
},{}]},{},[1]);
