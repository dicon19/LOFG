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
        this.nameField = this.add.dom(640, 460).createFromCache("name_field");
        this.nameField.getChildByName("inputField").value = name;
        this.nameField.addListener("click");
        this.nameField.on("click", (event) => {
            if (event.target.name == "playButton") {
                if (this.nameField.getChildByName("inputField").value != "") {
                    name = this.nameField.getChildByName("inputField").value;
                } else {
                    // 기본 이름 설정
                    name = "플레이어";
                }
                this.socket.disconnect();
                this.scene.start("ingameScene");
            }
        });

        // 커스텀마이즈 씬 이동 버튼
        this.customize = new Button(this, 100, 600, "button_customize", () => {
            name = this.nameField.getChildByName("inputField").value;
            this.socket.disconnect();
            this.scene.start("customizeScene");
        });

        // 웹사이트 이동 버튼
        this.website = new Button(this, 1160, 600, "button_website", () => {
            window.open("https://www.facebook.com/groups/1467345873420940/");
        });

        // 크래딧
        this.crdit = this.add
            .text(640, 640, "강준하,김형규,박경서,안정훈,정지은@2019선린디콘", {
                fontFamily: "NanumGothic",
                fontSize: "14px",
                stroke: "#000000",
                strokeThickness: 4
            })
            .setOrigin(0.5);

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
