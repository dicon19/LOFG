/*
 * 부트 씬
 */
var boot = {
    preload: function() {
        // 전체화면 설정
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.stage.disableVisibilityChange = true;

        // 리소스 로드
        this.load.image('ball', 'Assets/ball.png');
        this.load.image('button', 'Assets/button.png');
        this.load.image('wallpaper', 'Assets/wallpaper.png');
        this.add.text(0, 0, "Font loading...", {
            fontSize: "1px"
        });
        this.load.audio('menu', 'Assets/menu.mp3');
        this.load.audio('ingame', 'Assets/ingame.mp3');

        // 입력장치 로드
        cursors = this.input.keyboard.createCursorKeys();
    },

    create: function() {
        this.stage.backgroundColor = "#4488AA";
        this.state.start('menuScene');

        // 오디오 테스트
        //bgmAudio = this.add.audio("menu");
        //bgmAudio.loopFull(1);
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
game.state.add('bootScene', boot);
game.state.add('menuScene', menu);
game.state.add('ingameScene', ingame);
game.state.start('bootScene');

/*
 * 소켓 설정
 */
var socket = io();