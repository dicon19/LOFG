class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "menuScene" });
    }

    create() {
        this.socket = io();

        // 배경
        this.cameras.main.setBackgroundColor("#50bcdf");

        // UI
        this.add
            .sprite(640, 180, "logo")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(480, 240);

        this.onlinePlayerText = this.add
            .text(640, 340, "", {
                fontFamily: '"NanumGothic"',
                fontSize: "24px"
            })
            .setOrigin(0.5, 0.5);

        this.element = this.add.dom(640, 400).createFromCache("nameform");
        this.element.getChildByName("nameField").value = name;
        this.element.addListener("click");
        this.element.on("click", (event) => {
            if (event.target.name == "playButton") {
                name = this.element.getChildByName("nameField").value;
                this.socket.disconnect();
                this.scene.start("ingameScene");
            }
        });

        this.customize = this.add
            .sprite(120, 640, "customize")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => {
                name = this.element.getChildByName("nameField").value;
                this.socket.disconnect();
                this.scene.start("customizeScene");
            });

        this.facebook = this.add
            .sprite(1160, 640, "facebook")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120);

        // 접속중인 플레이어 수 받기
        this.socket.on("getPlayers", (players) => {
            this.onlinePlayerText.setText(players + " 접속중");
        });
    }
}
