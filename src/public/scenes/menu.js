class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "menuScene" });
    }

    create() {
        this.cameras.main.setBackgroundColor("#50bcdf");

        this.add
            .sprite(640, 180, "logo")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(480, 240);

        this.onlineUserText = this.add
            .text(640, 340, "너만 접속ㅎ", {
                fontFamily: '"NanumGothic"',
                fontSize: "24px"
            })
            .setOrigin(0.5, 0.5);

        this.element = this.add.dom(640, 400).createFromCache("nameform");
        this.element.addListener("click");
        this.element.on("click", (event) => {
            if (event.target.name == "playButton") {
                console.log("이름: " + this.element.getChildByName("nameField").value);
                this.scene.start("ingameScene");
            }
        });

        this.customize = this.add
            .sprite(120, 640, "customize")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("customizeScene"));

        this.facebook = this.add
            .sprite(1160, 640, "facebook")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120);
    }
}
