/*
 * 부트 씬
 */
var init = {
    preload: function () {
        // 전체화면 설정
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.disableVisibilityChange = true;

        // 리소스 로드
        game.load.image("ball", "Assets/ball.png");
        game.load.image("button", "Assets/button.png");
        game.load.image("wallpaper", "Assets/wallpaper.png");
        game.load.image("dummy_player", "Assets/dummy_player.png");
        game.add.text(0, 0, "Font loading...", {
            fontSize: "1px"
        });
        game.load.audio("menu", "Assets/menu.mp3");
        game.load.audio("ingame", "Assets/ingame.mp3");
        game.plugins.add(PhaserInput.Plugin);

        // 입력장치 초기화
        cursors = game.input.keyboard.createCursorKeys();
    },

    create: function () {
        game.state.start("menuScene");
    },
}

/*
 * 글로벌 변수
 */
var gameWidth = 1920;
var gameHeight = 1080;
var cursors;

/*
 * 게임 씬 로드
 */
var game = new Phaser.Game(gameWidth, gameHeight);
game.state.add("initScene", init);
game.state.add("menuScene", menu);
game.state.add("ingameScene", ingame);
game.state.start("initScene");

/*
 * 소켓 설정
 */
var socket = io();