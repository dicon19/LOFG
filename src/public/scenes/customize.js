class CustomizeScene extends Phaser.Scene {
    constructor() {
        super({ key: "customizeScene" });
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.pos = SKINS.indexOf(skin);

        this.helpText = this.add
            .text(640, 180, "캐릭터 선택", {
                fontFamily: "NanumGothic",
                fontSize: "64px",
                shadow: {
                    offsetX: 5,
                    offsetY: 5,
                    color: "#cccccc",
                    blur: 10,
                    fill: true
                }
            })
            .setOrigin(0.5);

        this.leftArrow = new Button(this, 320, 360, "button_arrow", () => {
            if (this.pos > 0) {
                this.pos--;
            } else {
                this.pos = SKINS.length - 1;
            }
            skin = SKINS[this.pos];
            this.player.anims.play(skin + "_move", true);
        });
        this.leftArrow.flipX = true;

        this.rightArrow = new Button(this, 960, 360, "button_arrow", () => {
            if (this.pos < SKINS.length - 1) {
                this.pos++;
            } else {
                this.pos = 0;
            }
            skin = SKINS[this.pos];
            this.player.anims.play(skin + "_move", true);
        });

        this.player = this.add
            .sprite(640, 360, skin)
            .setScale(3)
            .anims.play(skin + "_move", true);

        this.selectButton = new Button(this, 640, 520, "button", () => {
            this.scene.start("menuScene");
        });
    }
}
