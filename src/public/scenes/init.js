class InitScene extends Phaser.Scene {
    constructor() {
        super({ key: "initScene" });
    }

    preload() {
        // 리소스 불러오기
        this.load.image("logo", "assets/sprites/logo.png");
        this.load.image("customize", "assets/sprites/customize.png");
        this.load.image("facebook", "assets/sprites/facebook.png");
        this.load.image("arrow", "assets/sprites/arrow.png");
        this.load.image("button", "assets/sprites/button.png");
        this.load.image("player1", "assets/sprites/player1.png");
        this.load.image("player2", "assets/sprites/player2.png");
        this.load.image("player3", "assets/sprites/player3.png");
        this.load.image("bullet", "assets/sprites/bullet.png");
        this.load.image("tileset1", "assets/tilesets/four-seasons-tileset.png");
        this.load.image("tileset2", "assets/tilesets/[32x32] Rocky Grass.png");

        this.load.html("nameform", "assets/form/nameform.html");

        this.load.tilemapTiledJSON("map1", "assets/tilemaps/map1.json");
        this.load.tilemapTiledJSON("map2", "assets/tilemaps/map2.json");

        this.load.spritesheet("player1_walk", "assets/animations/player1_walk.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("player2_walk", "assets/animations/player2_walk.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("player3_walk", "assets/animations/player3_walk.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // 애니메이션 추가
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
            key: "player1_walk",
            frames: this.anims.generateFrameNames("player1_walk"),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player2_walk",
            frames: this.anims.generateFrameNames("player2_walk"),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "player3_walk",
            frames: this.anims.generateFrameNames("player3_walk"),
            frameRate: 12,
            repeat: -1
        });

        // 메뉴 씬 전환
        this.scene.start("menuScene");
    }
}
