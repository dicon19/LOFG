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
            .setOrigin(0.5);

        // <=
        this.leftArrow = new Button(this, 320, 360, "arrow", () => {
            if (this.pos > 0) {
                this.pos--;
            } else {
                this.pos = SKINS.length - 1;
            }
            skin = SKINS[this.pos];
            this.player.anims.play(skin + "_move", true);
        });
        this.leftArrow.flipX = true;

        // =>
        this.rightArrow = new Button(this, 960, 360, "arrow", () => {
            if (this.pos < SKINS.length - 1) {
                this.pos++;
            } else {
                this.pos = 0;
            }
            skin = SKINS[this.pos];
            this.player.anims.play(skin + "_move", true);
        });

        // 메뉴 씬 이동 버튼
        this.selectButton = new Button(this, 640, 520, "button", () => {
            this.scene.start("menuScene");
        });

        // 캐릭터
        this.player = this.add
            .sprite(640, 360, skin)
            .setScale(3)
            .anims.play(skin + "_move", true);
        // #endregion
    }
}
