var config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    // 리소스 불러오기
    this.load.spritesheet(
        "player1_walk",
        "assets/animations/player1_walk.png",
        {
            frameWidth: 32,
            frameHeight: 32
        }
    );
    this.load.spritesheet(
        "player2_walk",
        "assets/animations/player2_walk.png",
        {
            frameWidth: 32,
            frameHeight: 32
        }
    );
    this.load.spritesheet(
        "player3_walk",
        "assets/animations/player3_walk.png",
        {
            frameWidth: 32,
            frameHeight: 32
        }
    );

    this.load.image("player1", "assets/sprites/player1.png");
    this.load.image("player2", "assets/sprites/player2.png");
    this.load.image("player3", "assets/sprites/player3.png");
    this.load.image("tiles", "assets/tilesets/four-seasons-tileset.png");

    this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
}

function create() {
    this.socket = io();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.players = this.add.group();
    this.bullets = this.add.group();

    // 애니메이션 추가
    this.anims.create({
        key: "player1_idle",
        frames: [{ key: "player1" }],
        frameRate: 12,
        repeat: -1
    });
    this.anims.create({
        key: "player2_idle",
        frames: [{ key: "player2" }],
        frameRate: 12,
        repeat: -1
    });
    this.anims.create({
        key: "player3_idle",
        frames: [{ key: "player3" }],
        frameRate: 12,
        repeat: -1
    });
    this.anims.create({
        key: "player1_walk",
        frames: this.anims.generateFrameNames("player1_walk"),
        frameRate: 12,
        repeat: -1
    });
    this.anims.create({
        key: "player2_walk",
        frames: this.anims.generateFrameNames("player2_walk"),
        frameRate: 12,
        repeat: -1
    });
    this.anims.create({
        key: "player3_walk",
        frames: this.anims.generateFrameNames("player3_walk"),
        frameRate: 12,
        repeat: -1
    });

    // UI
    this.timerText = this.add.text(120, 60, "", {
        fontFamily: '"NanumGothic"',
        fontSize: "64px"
    });

    this.pingText = this.add.text(340, 60, "", {
        fontFamily: '"NanumGothic"',
        fontSize: "32px"
    });

    // 타이머
    this.timer = "10:00";
    this.timerAlarm = this.time.addEvent({
        delay: 1000,
        callback: () => {
            var min = Number(this.timer.substr(0, 2));
            var sec = Number(this.timer.substr(3, 2));

            if (sec > 0) {
                sec--;
            } else {
                min--;
                sec = 59;
            }

            if (sec < 10) {
                sec = "0" + sec;
            }

            if (min < 10) {
                min = "0" + min;
            }
            this.timer = min + ":" + sec;
            this.timerText.setText(this.timer);
        },
        callbackScope: this,
        loop: true
    });

    // 핑 보내기
    var startTime;
    setInterval(() => {
        startTime = Date.now();
        this.socket.emit("latency");
    }, 1000);

    // (나를 포함한)서버에 있는 모든 플레이어 정보 받아오기
    this.socket.on("currentPlayers", (players) => {
        Object.keys(players).forEach((id) => {
            var playerInfo = players[id];

            if (playerInfo.playerId == this.socket.id) {
                // 카메라 플레이어 고정
                this.myPlayer;
            }
            addPlayer(this, playerInfo);
        });
    });

    // 새로운 플레이어 접속
    this.socket.on("newPlayer", (playerInfo) => {
        addPlayer(this, playerInfo);
    });

    // 플레이어 접속 끊김
    this.socket.on("disconnect", (playerId) => {
        this.players.getChildren().forEach((player) => {
            if (playerId == player.playerId) {
                player.destroy();
            }
        });
    });

    // 게임 업데이트
    this.socket.on("playerUpdates", (players) => {
        Object.keys(players).forEach((id) => {
            this.players.getChildren().forEach((player) => {
                var playerInfo = players[id];

                if (playerInfo.playerId == player.playerId) {
                    // 플레이어 위치 설정
                    player.setPosition(playerInfo.x, playerInfo.y);

                    // 플레이어 애니메이션 설정
                    if (playerInfo.isMove) {
                        player.anims.play(playerInfo.sprite + "_walk", true);
                    } else {
                        player.anims.play(playerInfo.sprite + "_idle", true);
                    }
                    player.flipX = playerInfo.flipX;
                }
            });
        });
    });

    // 핑 확인
    this.socket.on("latency", () => {
        var latency = Date.now() - startTime;
        this.pingText.setText(latency);
    });

    // 맵 불러오기
    var map = this.make.tilemap({ key: "map" });
    var tileset = map.addTilesetImage("tileset", "tiles");
    var worldLayer = map.createStaticLayer("world", tileset, 0, 0);
    worldLayer.setDepth(-100);
}

function update() {
    // 플레이어 이동 | 공격
    var left = this.cursors.left.isDown;
    var right = this.cursors.right.isDown;
    var up = this.cursors.up.isDown;
    var attack = this.cursors.space.isDown;

    if (left || right || up || attack) {
        this.socket.emit("playerInput", {
            left: left,
            right: right,
            up: up,
            attack: attack
        });
    }
}

function addPlayer(self, playerInfo) {
    var player = self.add
        .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
        .setOrigin(0.5, 0.5);
    self.players.add(player);
    player.playerId = playerInfo.playerId;
}
