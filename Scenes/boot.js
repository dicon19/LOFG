/*
 * 부트 씬
 */
var cursors;

var boot = {
    name: "boot",

    preload: function() {
        // 전체화면 설정
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.disableVisibilityChange = true;

        // 리소스 로드
        game.load.image('button', 'Assets/button.png');
        game.load.image('wallpaper', 'Assets/wallpaper.png');
        game.add.text(0, 0, "Font loading...", {
            fontSize: "1px"
        });
        game.load.audio('menu', 'Assets/menu.mp3');
        game.load.audio('ingame', 'Assets/ingame.mp3');

        // 입력장치 로드
        cursors = game.input.keyboard.createCursorKeys();
    },

    create: function() {
        game.stage.backgroundColor = "#4488AA";
        game.state.start('menuScene');
    },
}