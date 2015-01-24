var button;
var half_button_width = 124;
var half_button_height = 32;
var actionOnClick = function () {
	console.log('click');
	game.state.start('level-1');
};
var pad_clicked = false; 
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

var addLevelButton = function (text,x,y) {
    var lb = game.add.bitmapText(x, y, 'bits-0',text,32);
    lb.inputEnabled = true;

    lb.events.onInputOver.add(over, this);
    lb.events.onInputOut.add(out, this); 
    lb.events.onInputDown.add(actionOnClick, this); 
}
module.exports = {
    create: function(){
    //This is just like any other Phaser create function
    //game.state.start('play');

    	//button = game.add.button(half_button_width, (game.world.centerY - half_button_height), 'button', actionOnClick, this, 1, 0, 2);
        addLevelButton('Level 1',32,16);
        addLevelButton('Level 2',32*6,16);
        addLevelButton('Level 3',32*12,16);
        addLevelButton('Level 4',32,16*5);
        addLevelButton('Level 5',32*6,16*5);
        addLevelButton('Level 6',32*12,16*5);
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
