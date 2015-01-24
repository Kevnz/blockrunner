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
        game.load.bitmapFont('bits-1', 'assets/fonts/bits1.png', 'assets/fonts/bits1.fnt');
        game.load.bitmapFont('bits-2', 'assets/fonts/bits2.png', 'assets/fonts/bits2.fnt');
        game.load.text('level-1', 'levels/level-1.txt');
        game.load.text('level-2', 'levels/level-2.txt');
    },

    create: function () {
        game.state.start('menu');
    }
};
