class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "menuScene" });
    }

    create() {
        this.socket = io();

        // 배경 설정
        this.background = this.add.sprite(0, 0, "background1").setOrigin(0);

        // 로고
        this.logo = this.add.sprite(640, 240, "logo");

        // 접속중인 플레이어 수
        this.onlinePlayerText = this.add
            .text(640, 400, "연결중...", {
                fontFamily: "NanumGothic",
                fontSize: "24px"
            })
            .setOrigin(0.5);

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
        this.customize = new Button(this, 100, 600, "customize", () => {
            name = this.element.getChildByName("nameField").value;
            this.socket.disconnect();
            this.scene.start("customizeScene");
        });

        // 크래딧 씬 이동 버튼
        this.credit = new Button(this, 1160, 600, "credit", () => {
            name = this.element.getChildByName("nameField").value;
            this.socket.disconnect();
            this.scene.start("creditScene");
        });

        // 접속중인 플레이어 수 받기
        this.socket.on("getPlayers", (players) => {
            this.onlinePlayerText.setText(players + " 게임중");
        });

        // 배경음악 재생
        ingameBgm[ingameBgmIndex].stop();

        if (!bgmScheme.isPlaying) {
            bgmScheme.play();
        }
    }
}
