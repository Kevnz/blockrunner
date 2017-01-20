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
