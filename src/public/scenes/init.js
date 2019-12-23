class InitScene extends Phaser.Scene {
    constructor() {
        super({ key: "initScene" });
    }

    preload() {
        // 리소스 불러오기
        this.load.image("background1", "assets/backgrounds/bg_background1.png");
        this.load.image("background2", "assets/backgrounds/bg_background2.png");
        this.load.image("logo", "assets/sprites/spr_logo.png");
        this.load.image("button_customize", "assets/sprites/spr_button_customize.png");
        this.load.image("button_website", "assets/sprites/spr_button_website.png");
        this.load.image("button_arrow", "assets/sprites/spr_button_arrow.png");
        this.load.image("button", "assets/sprites/spr_button.png");
        this.load.image("timer", "assets/sprites/spr_timer.png");
        this.load.image("ping", "assets/sprites/spr_ping.png");
        this.load.image("button_resume", "assets/sprites/spr_button_resume.png");
        this.load.image("button_exit", "assets/sprites/spr_button_exit.png");
        this.load.image("arrow", "assets/sprites/spr_arrow.png");
        this.load.image("weapon", "assets/sprites/spr_weapon.png");
        this.load.image("weapon_rapid", "assets/sprites/spr_weapon_rapid.png");
        this.load.image("item_weapon_rapid", "assets/sprites/spr_item_weapon_rapid.png");
        this.load.image("item_heal", "assets/sprites/spr_item_heal.png");
        this.load.image("tileset", "assets/tilesets/tile_tileset.png");
        this.load.image("bullet", "assets/sprites/spr_bullet.png");

        this.load.tilemapTiledJSON("tilemap1", "assets/tilemaps/map_tilemap1.json");
        this.load.tilemapTiledJSON("tilemap2", "assets/tilemaps/map_tilemap2.json");
        this.load.tilemapTiledJSON("tilemap3", "assets/tilemaps/map_tilemap3.json");
        this.load.tilemapTiledJSON("tilemap4", "assets/tilemaps/map_tilemap4.json");
        this.load.tilemapTiledJSON("tilemap5", "assets/tilemaps/map_tilemap5.json");
        this.load.tilemapTiledJSON("tilemap6", "assets/tilemaps/map_tilemap6.json");
        this.load.tilemapTiledJSON("tilemap7", "assets/tilemaps/map_tilemap7.json");

        this.load.html("name_field", "assets/forms/form_name_field.html");

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
        this.load.audio("attack", "assets/sounds/sfx_attack.ogg");
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
            this.progressBar.fillStyle(0xffffff);
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
        sfxAttack = this.sound.add("attack");
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
