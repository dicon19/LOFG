class CustomizeScene extends Phaser.Scene {
    constructor() {
        super({ key: "customizeScene" });
    }

    create() {
        this.pos = SKINS.indexOf(skin);

        // 배경 초기화
        this.cameras.main.setBackgroundColor("#81c147");

        // #region UI
        // <=
        this.leftArrow = this.add
            .sprite(320, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => {
                if (this.pos > 0) {
                    this.pos--;
                } else {
                    this.pos = SKINS.length - 1;
                }
                skin = SKINS[this.pos];
                this.player.anims.play(skin + "_move", true);
            }).flipX = true;

        // =>
        this.rightArrow = this.add
            .sprite(960, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => {
                if (this.pos < SKINS.length - 1) {
                    this.pos++;
                } else {
                    this.pos = 0;
                }
                skin = SKINS[this.pos];
                this.player.anims.play(skin + "_move", true);
            });

        // 메뉴 씬 이동 버튼
        this.selectButton = this.add
            .sprite(640, 520, "button")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.start("menuScene");
            });

        // 캐릭터
        this.player = this.add
            .sprite(640, 360, skin)
            .setOrigin(0.5, 0.5)
            .setScale(3)
            .anims.play(skin + "_move", true);
        // #endregion
    }
}
