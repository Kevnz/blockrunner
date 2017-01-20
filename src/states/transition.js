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
