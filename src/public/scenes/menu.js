class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "menuScene" });
    }

    create() {
        this.socket = io({
            transports: ["websocket"]
        });

        // 배경 초기화
        this.add.sprite(0, 0, "background1").setOrigin(0, 0);

        // #region UI
        // 로고
        this.add.sprite(640, 240, "logo").setOrigin(0.5, 0.5);

        // 접속중인 플레이어 수
        this.onlinePlayerText = this.add
            .text(640, 400, "0 접속중", {
                fontFamily: "NanumGothic",
                fontSize: "24px"
            })
            .setOrigin(0.5, 0.5);

        // 이름 입력 창
        this.element = this.add.dom(640, 460).createFromCache("nameform");
        this.element.getChildByName("nameField").value = name;
        this.element.addListener("click");
        this.element.on("click", (event) => {
            if (event.target.name == "playButton") {
                if (this.element.getChildByName("nameField").value != "") {
                    name = this.element.getChildByName("nameField").value;
                } else {
                    // 기본 이름 설정
                    name = "플레이어";
                }
                this.socket.disconnect();
                this.scene.start("ingameScene");
            }
        });

        // 커스텀마이즈 씬 이동 버튼
        this.customize = this.add
            .sprite(120, 600, "customize")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => {
                name = this.element.getChildByName("nameField").value;
                this.socket.disconnect();
                this.scene.start("customizeScene");
            });

        // 페이스북
        this.facebook = this.add
            .sprite(1160, 600, "facebook")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120);
        // #endregion

        // 접속중인 플레이어 수 받기
        this.socket.on("getPlayers", (players) => {
            this.onlinePlayerText.setText(players + " 접속중");
        });
    }
}
