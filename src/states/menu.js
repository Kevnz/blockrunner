var button;
var half_button_width = 124;
var half_button_height = 32;
var actionOnClick = function () {
	console.log('click');
	game.state.start('level1');
};
var pad_clicked = false; 

module.exports = {
    create: function(){
    //This is just like any other Phaser create function
    //game.state.start('play');

    	button = game.add.button(half_button_width, (game.world.centerY - half_button_height), 'button', actionOnClick, this, 1, 0, 2);


		//button.onInputOver.add(over, this);
		//button.onInputOut.add(out, this);
		//button.onInputUp.add(up, this);

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
