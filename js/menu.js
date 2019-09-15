/*
 * 메뉴 씬
 */
var menu = {
    create: function () {
        this.buttons = [];
        this.fontStyle = {
            fill: '#ffffff',
            align: 'center',
        };
        this.scenePage = 4;
        this.cameraY = 0;

        this.createButton(gameWidth / 2, 200, 'button', this.gameStartClick, false);
        this.createButton(gameWidth / 2, 400, 'button', this.customizeClick, false);
        this.createButton(gameWidth / 2, 800, 'button', this.creditClick, false);
        this.createButton(100, 100, 'button', this.backClick, this, true);
        //this.createButton(gameWidth / 2, this.world.height / this.scenePage * 1 - gameHeight / 2, 'button', this.gameStartClick, false);

        this.world.setBounds(0, 0, gameWidth, gameHeight * this.scenePage);
        this.stage.backgroundColor = "#4488AA";
    },

    update: function() {
        // TWEEN
        this.camera.y += (this.cameraY - this.camera.y) / 10;
        
        this.buttons.forEach((button) => {
            button.scale.x += (button.size - button.scale.x) / 4;
            button.scale.y += (button.size - button.scale.y) / 4;

            if (button.fixedToCamera) {
                button.alpha = this.camera.y / this.cameraY;
            }
        });
    },

    createButton: function(x, y, sprite, callback, isFixed) {
        var button = this.add.button(x, y, sprite, callback, this);
        button.onInputOver.add(this.buttonOver, this);
        button.onInputOut.add(this.buttonOut, this);
        button.anchor.set(0.5);
        button.size = 1;
        this.buttons.push(button);

        var text = this.add.text(button.x, button.y, '앙기모띠', this.fontStyle);
        text.anchor.set(0.5);

        if (isFixed) {
            button.fixedToCamera = true;
            text.fixedToCamera = true;
        }
    },

    buttonOver: function(button) {
        button.size = 1.5;
    },

    buttonOut: function(button) {
        button.size = 1;
    },

    gameStartClick: function () {
        this.cameraY = this.world.height / this.scenePage * 2 - gameHeight / 2;
    },

    customizeClick: function () {
        this.cameraY = this.world.height / this.scenePage * 3 - gameHeight / 2;
    },

    creditClick: function () {
        this.cameraY = this.world.height / this.scenePage * 4 - gameHeight / 2;
    },

    backClick: function () {
        this.cameraY = 0;
    },
}