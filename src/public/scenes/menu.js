class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "menuScene" });
    }

    create() {
        this.cameras.main.setBackgroundColor("#50bcdf");

        this.add
            .sprite(640, 200, "logo")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(480, 240);

        this.onlineUserText = this.add
            .text(640, 360, "너만 접속ㅎ", {
                fontFamily: '"NanumGothic"',
                fontSize: "24px"
            })
            .setOrigin(0.5, 0.5);

        this.element = this.add.dom(640, 480).createFromCache("nameform");
        this.element.addListener("click");
        this.element.on("click", (event) => {
            if (event.target.name == "playButton") {
                console.log("이름: " + this.element.getChildByName("nameField").value);
                this.scene.start("ingameScene");
            }
        });
    }
}
