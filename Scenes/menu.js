/*
 * 메뉴 씬
 */
var menu = {
    create: function () {
        // 변수 초기화
        this.buttons = [];
        this.cameraY = 0;
        this.room1Player = 0;
        this.room2Player = 0;
        this.room3Player = 0;

        // 월드 초기화
        game.world.setBounds(0, 0, gameWidth, gameHeight * 4);
        game.stage.backgroundColor = "#4488AA";

        // UI 초기화
        this.createButton(100, 100, "button", this.menuSector, true);

        this.logo = game.add.sprite(gameWidth / 2, 200, "logo");
        this.logo.anchor.set(0.5);
        this.createButton(gameWidth / 2, 460, "button", this.lobySector, false);
        this.createButton(gameWidth / 2, 600, "button", this.customizeSector, false);
        this.createButton(gameWidth / 2, 800, "button", this.creditSector, false);

        this.createButton(400, 1600, "button", this.enterIngame1, false);
        this.createButton(1000, 1600, "button", this.enterIngame2, false);
        this.createButton(1600, 1600, "button", this.enterIngame3, false);
        this.room1PlayerText = game.add.text(400, 1800, "");
        this.room1PlayerText.anchor.set(0.5);
        this.room2PlayerText = game.add.text(1000, 1800, "");
        this.room2PlayerText.anchor.set(0.5);
        this.room3PlayerText = game.add.text(1600, 1800, "");
        this.room3PlayerText.anchor.set(0.5);

        this.nicknameInput = game.add.inputField(460, 3000, {
            font: "64px",
            width: 1000,
            max: 10,
            padding: 18,
            borderWidth: 4,
            borderColor: "#000000",
            borderRadius: 100,
            placeHolder: "이름",
            textAlign: "center",
            type: PhaserInput.InputType.text
        });
        this.player = game.add.sprite(gameWidth / 2, 2600, "dummy_player");
        this.player.anchor.set(0.5);

        this.creditText = game.add.text(500, 3800, "준하살법@2018 선린디콘 | 몬생긴 강준하, 더몬생긴 안정훈,  박효신 김형규 개발");

        // 소켓 설정
        socket.on("disconnect", () => {

        });
        socket.emit("enterLoby");
    },

    update: function () {
        // 카메라 | 버튼 부드러운 움직임
        game.camera.y += (this.cameraY - game.camera.y) / 20;

        this.buttons.forEach((button) => {
            button.scale.x += (button.size - button.scale.x) / 4;
            button.scale.y += (button.size - button.scale.y) / 4;

            if (button.fixedToCamera) {
                button.alpha = game.camera.y / this.cameraY;
            }
        });

        // UI 설정
        this.room1PlayerText.setText("접속: " + this.room1Player);
        this.room2PlayerText.setText("접속: " + this.room2Player);
        this.room3PlayerText.setText("접속: " + this.room3Player);

        // 플레이어 정보 설정
        playerInfo.nickname = this.nicknameInput.value;
    },

    createButton: function (x, y, sprite, callback, isFixed) {
        var button = game.add.button(x, y, sprite, callback, this);
        button.onInputOver.add(this.buttonOver, this);
        button.onInputOut.add(this.buttonOut, this);
        button.anchor.set(0.5);
        button.size = 1;
        this.buttons.push(button);

        if (isFixed) {
            button.fixedToCamera = true;
        }
    },

    buttonOver: function (button) {
        button.size = 1.2;
    },

    buttonOut: function (button) {
        button.size = 1;
    },

    menuSector: function () {
        this.cameraY = 0;
    },

    lobySector: function () {
        this.cameraY = gameHeight * 1;
    },

    customizeSector: function () {
        this.cameraY = gameHeight * 2;
    },

    creditSector: function () {
        this.cameraY = gameHeight * 3;
    },

    enterIngame1: function () {
        socket.emit("enterIngame", 1);
    },

    enterIngame2: function () {
        socket.emit("enterIngame", 2);
    },

    enterIngame3: function () {
        socket.emit("enterIngame", 3);
    },
};