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
