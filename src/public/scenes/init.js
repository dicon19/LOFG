class InitScene extends Phaser.Scene {
    constructor() {
        super({ key: "initScene" });
    }

    preload() {
        // #region 리소스 불러오기
        this.load.image("logo", "assets/sprites/logo.png");
        this.load.image("customize", "assets/sprites/customize.png");
        this.load.image("facebook", "assets/sprites/facebook.png");
        this.load.image("arrow", "assets/sprites/arrow.png");
        this.load.image("button", "assets/sprites/button.png");
        this.load.image("timer", "assets/sprites/timer.png");
        this.load.image("ping", "assets/sprites/ping.png");
        this.load.image("bullet", "assets/sprites/bullet.png");

        this.load.image("tileset1", "assets/tilesets/four-seasons-tileset.png");
        this.load.image("tileset2", "assets/tilesets/[32x32] Rocky Grass.png");
        this.load.tilemapTiledJSON("map1", "assets/tilemaps/map1.json");
        this.load.tilemapTiledJSON("map2", "assets/tilemaps/map2.json");

        this.load.image("player1", "assets/sprites/player1.png");
        this.load.image("player2", "assets/sprites/player2.png");
        this.load.image("player3", "assets/sprites/player3.png");
        this.load.spritesheet("player1_move", "assets/animations/player1_move.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("player2_move", "assets/animations/player2_move.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("player3_move", "assets/animations/player3_move.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.html("nameform", "assets/form/nameform.html");

        this.load.audio("bgm1", "assets/sounds/bgm/bgm1.mp3");
        this.load.audio("hurt", "assets/sounds/sfx/hurt.mp3");
        // #endregion

        // #region 로딩바
        const LOADING_BAR_X = this.cameras.main.width / 2;
        const LOADING_BAR_Y = this.cameras.main.height / 2;
        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();

        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(LOADING_BAR_X - 160, LOADING_BAR_Y - 20, 320, 40);

        this.loadingText = this.make
            .text({
                x: LOADING_BAR_X,
                y: LOADING_BAR_Y - 50,
                text: "잠시만 기다려주세요",
                style: {
                    font: "24px NanumGothic",
                    fill: "#ffffff"
                }
            })
            .setOrigin(0.5, 0.5);

        this.percentText = this.make
            .text({
                x: LOADING_BAR_X,
                y: LOADING_BAR_Y,
                text: "0%",
                style: {
                    font: "18px NanumGothic",
                    fill: "#ffffff"
                }
            })
            .setOrigin(0.5, 0.5);

        this.assetText = this.make
            .text({
                x: LOADING_BAR_X,
                y: LOADING_BAR_Y + 50,
                text: "",
                style: {
                    font: "18px NanumGothic",
                    fill: "#ffffff"
                }
            })
            .setOrigin(0.5, 0.5);

        this.load.on("progress", (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(LOADING_BAR_X - 155, LOADING_BAR_Y - 15, 310 * value, 30);
            this.percentText.setText(parseInt(value * 100) + "%");
        });

        this.load.on("fileprogress", (file) => {
            this.assetText.setText("Loading asset: " + file.key);
        });

        this.load.on("complete", () => {
            this.progressBar.destroy();
            this.progressBox.destroy();
            this.loadingText.destroy();
            this.percentText.destroy();
            this.assetText.destroy();
        });
        // #endregion
    }

    create() {
        // #region 애니메이션 추가
        this.anims.create({
            key: "player1_idle",
            frames: [{ key: "player1" }],
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player2_idle",
            frames: [{ key: "player2" }],
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player3_idle",
            frames: [{ key: "player3" }],
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player1_move",
            frames: this.anims.generateFrameNames("player1_move"),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player2_move",
            frames: this.anims.generateFrameNames("player2_move"),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player3_move",
            frames: this.anims.generateFrameNames("player3_move"),
            frameRate: 12,
            repeat: -1
        });
        // #endregion

        // 메뉴 씬 이동
        this.scene.start("menuScene");
    }
}
