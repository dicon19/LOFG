/*
 * 메뉴 씬
 */
var menu = {
    create: function () {
        // 변수 초기화
        this.buttons = [];
        this.cameraY = 0;
        this.onlineUser = 0;
        this.roomCode = "#0000";

        // 월드 초기화
        this.world.setBounds(0, 0, gameWidth, gameHeight * this.sectorPage);
        this.stage.backgroundColor = "#4488AA";

        // UI
        this.createButton(100, 100, "button", this.menuSector, true);

        this.createButton(gameWidth / 2, 200, "button", this.lobySector, false);
        this.createButton(gameWidth / 2, 400, "button", this.customizeSector, false);
        this.createButton(gameWidth / 2, 800, "button", this.creditSector, false);

        this.onlineUserText = game.add.text(1800, 1100, this.onlineUser + ":온라인");
        this.roomCodeText = game.add.text(gameWidth / 2, 1100, this.roomCode);
        this.roomCodeInput = game.add.inputField(700, 1800, {
            font: "64px",
            width: 300,
            max: 4,
            padding: 32,
            borderWidth: 4,
            borderColor: "#000000",
            borderRadius: 100,
            placeHolder: "방코드",
            textAlign: "center",
            type: PhaserInput.InputType.text
        });
        this.createButton(1400, 1800, "button", this.enterGame, false);
        this.player = game.add.sprite(gameWidth / 2, 1400, "dummy_player");
        this.player.anchor.set(0.5);

        this.customize = game.add.sprite(gameWidth / 2, 2600, "dummy_player");
        this.customize.anchor.set(0.5);

        this.creditText = game.add.text(gameWidth / 2, 3600, "개발진 크래딧 딱 앙 기모띠");

        // 소켓 설정
        socket.on("disconnect", () => {
            this.onlineUser--;
        });

        socket.on("onlineUser", (onlineUser) => {
            this.onlineUser = onlineUser;
        });

        socket.emit("onlineUser");
    },

    update: function () {
        // TWEEN
        this.camera.y += (this.cameraY - this.camera.y) / 10;

        this.buttons.forEach((button) => {
            button.scale.x += (button.size - button.scale.x) / 4;
            button.scale.y += (button.size - button.scale.y) / 4;

            if (button.fixedToCamera) {
                button.alpha = this.camera.y / this.cameraY;
            }
        });

        // UI
        this.onlineUserText.setText(this.onlineUser + ":온라인");
    },

    createButton: function (x, y, sprite, callback, isFixed) {
        var button = game.add.button(x, y, sprite, callback, this);
        button.onInputOver.add(this.buttonOver, this);
        button.onInputOut.add(this.buttonOut, this);
        button.anchor.set(0.5);
        button.size = 1;
        this.buttons.push(button);

        var text = game.add.text(button.x, button.y, "앙기모띠", this.fontStyle);
        text.anchor.set(0.5);

        if (isFixed) {
            button.fixedToCamera = true;
            text.fixedToCamera = true;
        }
    },

    buttonOver: function (button) {
        button.size = 1.5;
    },

    buttonOut: function (button) {
        button.size = 1;
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

    menuSector: function () {
        this.cameraY = 0;
    },

    enterGame: function () {
        this.state.start("ingameScene");
    },
}