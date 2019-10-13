class CustomizeScene extends Phaser.Scene {
    constructor() {
        super({ key: "customizeScene" });
    }

    create() {
        this.pos = SKINS.indexOf(skin);

        // 배경
        this.cameras.main.setBackgroundColor("#81c147");

        // UI
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
                this.player.anims.play(skin + "_walk", true);
            }).flipX = true;

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
                this.player.anims.play(skin + "_walk", true);
            });

        this.selectButton = this.add
            .sprite(640, 520, "button")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("menuScene"));

        this.player = this.add
            .sprite(640, 360, "player1")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(128, 128)
            .anims.play(skin + "_walk", true);
    }
}
