class InitScene extends Phaser.Scene {
    constructor() {
        super({ key: "initScene" });
    }

    preload() {
        // 리소스 불러오기
        this.load.image("background1", "assets/backgrounds/bg_menu.png");
        this.load.image("logo", "assets/sprites/spr_logo.png");
        this.load.image("customize", "assets/sprites/spr_button_customize.png");
        this.load.image("credit", "assets/sprites/spr_button_credit.png");
        this.load.image("arrow", "assets/sprites/spr_button_arrow.png");
        this.load.image("button", "assets/sprites/spr_button.png");
        this.load.image("timer", "assets/sprites/spr_timer.png");
        this.load.image("ping", "assets/sprites/spr_ping.png");
        this.load.image("resume", "assets/sprites/spr_button_resume.png");
        this.load.image("exit", "assets/sprites/spr_button_exit.png");
        this.load.image("enemyArrow", "assets/sprites/spr_enemy_arrow.png");
        this.load.image("weapon1", "assets/sprites/spr_weapon1.png");
        this.load.image("bullet1", "assets/sprites/spr_bullet1.png");
        this.load.image("moon", "assets/tilesets/tile_moon.png");

        this.load.tilemapTiledJSON("moon1", "assets/tilemaps/map_moon1.json");
        this.load.tilemapTiledJSON("moon2", "assets/tilemaps/map_moon2.json");

        this.load.html("nameform", "assets/forms/form_name.html");

        for (let i = 1; i <= SKINS.length; i++) {
            this.load.spritesheet("player" + i + "_idle", "assets/animations/anim_player" + i + "_idle.png", {
                frameWidth: 32,
                frameHeight: 32
            });
            this.load.spritesheet("player" + i + "_move", "assets/animations/anim_player" + i + "_move.png", {
                frameWidth: 32,
                frameHeight: 32
            });
        }

        this.load.audio("scheme", "assets/sounds/bgm_scheme.ogg");
        this.load.audio("ageOfWar", "assets/sounds/bgm_age_of_war.ogg");
        this.load.audio("battle3", "assets/sounds/bgm_battle_3.ogg");
        this.load.audio("dejaVu", "assets/sounds/bgm_deja_vu.ogg");
        this.load.audio("attack1", "assets/sounds/sfx_attack1.ogg");
        this.load.audio("clickHover", "assets/sounds/sfx_click_hover.ogg");
        this.load.audio("clickOn", "assets/sounds/sfx_click_on.ogg");
        this.load.audio("coin", "assets/sounds/sfx_coin.ogg");
        this.load.audio("heavyMachineGun", "assets/sounds/sfx_heavy_machine_gun.ogg");
        this.load.audio("playerDead", "assets/sounds/sfx_player_dead.ogg");
        this.load.audio("playerJump", "assets/sounds/sfx_player_jump.ogg");

        // 로딩바
        const LOADING_BAR_X = 640;
        const LOADING_BAR_Y = 360;
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
            .setOrigin(0.5);

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
            .setOrigin(0.5);

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
            .setOrigin(0.5);

        this.load.on("progress", (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(LOADING_BAR_X - 155, LOADING_BAR_Y - 15, 310 * value, 30);
            this.percentText.setText(parseInt(value * 100) + "%");
        });

        this.load.on("fileprogress", (file) => {
            this.assetText.setText("Loading asset: " + file.key);
        });
    }

    create() {
        // 애니메이션 추가
        for (let i = 1; i <= SKINS.length; i++) {
            this.anims.create({
                key: "player" + i + "_idle",
                frames: this.anims.generateFrameNames("player" + i + "_idle"),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: "player" + i + "_move",
                frames: this.anims.generateFrameNames("player" + i + "_move"),
                frameRate: 12,
                repeat: -1
            });
        }

        // 사운드 추가
        ingameBgm.push(this.sound.add("ageOfWar"));
        ingameBgm.push(this.sound.add("battle3"));
        ingameBgm.push(this.sound.add("dejaVu"));
        shuffle(ingameBgm);

        bgmScheme = this.sound.add("scheme");
        sfxAttack1 = this.sound.add("attack1");
        sfxClickHover = this.sound.add("clickHover");
        sfxClickOn = this.sound.add("clickOn");
        sfxCoin = this.sound.add("coin");
        sfxHeavyMachineGun = this.sound.add("heavyMachineGun");
        sfxPlayerDead = this.sound.add("playerDead");
        sfxPlayerJump = this.sound.add("playerJump");

        // 띠로링
        sfxCoin.play();

        // 메뉴 씬 이동
        this.cameras.main.fadeOut(4000);
        this.cameras.main.on("camerafadeoutcomplete", () => {
            this.scene.start("menuScene");
        });
    }
}
