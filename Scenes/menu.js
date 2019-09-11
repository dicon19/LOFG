/*
 * 메뉴 씬
 */
var menu = {
    create: function () {
        this.buttons = this.add.group(); 

        this.scenePage = 4;
        this.world.setBounds(0, 0, gameWidth, gameHeight * this.scenePage);

        this.gameStartBtn = this.add.button(500, this.world.height / this.scenePage * 1 - gameHeight / 2, 'button', this.gameStartClick, this);
        this.gameStartBtn.anchor.set(0.5);
        this.gameStartBtn.scale.setTo(0.5, 0.5);
        this.customizeBtn = this.add.button(900, this.world.height / this.scenePage * 1 - gameHeight / 2, 'button', this.customizeClick, this);
        this.customizeBtn.anchor.set(0.5);
        this.creditBtn = this.add.button(1300, this.world.height / this.scenePage * 1 - gameHeight / 2, 'button', this.creditClick, this);
        this.creditBtn.anchor.set(0.5);

        this.backBtn = this.add.button(100, 100, 'button', this.backClick, this);
        this.backBtn.anchor.set(0.5);
        this.backBtn.fixedToCamera = true;
    },

    update: function() {

    },

    createButton: function(x, y, sprite, callback) {
        var button = this.add.button(x, y, sprite, callback, this);
        button.anchor.set(0.5);
    },

    gameStartClick: function () {
        this.state.start('ingameScene');
        this.camera.y = this.world.height / this.scenePage * 2 - gameHeight / 2;
    },

    customizeClick: function () {
        //this.state.start('ingameScene');
        this.camera.y = this.world.height / this.scenePage * 3 - gameHeight / 2;
    },

    creditClick: function () {
        //this.state.start('ingameScene');
        this.camera.y = this.world.height / this.scenePage * 4 - gameHeight / 2;
    },

    backClick: function () {
        //this.state.start('ingameScene');
        this.camera.y = 0;
    },
}