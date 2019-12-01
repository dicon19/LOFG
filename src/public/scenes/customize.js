class CustomizeScene extends Phaser.Scene {
    constructor() {
        super({ key: "customizeScene" });
    }

    create() {
        this.pos = SKINS.indexOf(skin);

        // 배경 초기화
        this.cameras.main.setBackgroundColor("#81c147");

        // #region UI
        this.helpText = this.add
            .text(640, 180, "캐릭터 선택", {
                fontFamily: "NanumGothic",
                fontSize: "64px"
            })
            .setOrigin(0.5, 0.5);

        // <=
        this.leftArrow = this.add
            .sprite(320, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => {
                this.leftArrow.setTint(0xcccccc);
                this.leftArrow.dscale = 1.2;
            })
            .on("pointerout", () => {
                this.leftArrow.setTint(0xffffff);
                this.leftArrow.dscale = 1;
            })
            .on("pointerup", () => {
                if (this.pos > 0) {
                    this.pos--;
                } else {
                    this.pos = SKINS.length - 1;
                }
                skin = SKINS[this.pos];
                this.player.anims.play(skin + "_move", true);
            });
        this.leftArrow.flipX = true;
        this.leftArrow.dscale = 1;

        // =>
        this.rightArrow = this.add
            .sprite(960, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => {
                this.rightArrow.setTint(0xcccccc);
                this.rightArrow.dscale = 1.2;
            })
            .on("pointerout", () => {
                this.rightArrow.setTint(0xffffff);
                this.rightArrow.dscale = 1;
            })
            .on("pointerup", () => {
                if (this.pos < SKINS.length - 1) {
                    this.pos++;
                } else {
                    this.pos = 0;
                }
                skin = SKINS[this.pos];
                this.player.anims.play(skin + "_move", true);
            });
        this.rightArrow.dscale = 1;

        // 메뉴 씬 이동 버튼
        this.selectButton = this.add
            .sprite(640, 520, "button")
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => {
                this.selectButton.setTint(0xcccccc);
                this.selectButton.dscale = 1.2;
            })
            .on("pointerout", () => {
                this.selectButton.setTint(0xffffff);
                this.selectButton.dscale = 1;
            })
            .on("pointerup", () => {
                this.scene.start("menuScene");
            });
        this.selectButton.dscale = 1;

        // 캐릭터
        this.player = this.add
            .sprite(640, 360, skin)
            .setOrigin(0.5, 0.5)
            .setScale(3)
            .anims.play(skin + "_move", true);
        // #endregion
    }

    update() {
        this.leftArrow.scale += (this.leftArrow.dscale - this.leftArrow.scale) / 10;
        this.rightArrow.scale += (this.rightArrow.dscale - this.rightArrow.scale) / 10;
        this.selectButton.scale += (this.selectButton.dscale - this.selectButton.scale) / 10;
    }
}
