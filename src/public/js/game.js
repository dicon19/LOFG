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
    // 스프라이트 불러오기
    this.load.image("player", "assets/sprites/player.png");

    // 타일셋 불러오기
    this.load.image("tiles", "assets/tilesets/four-seasons-tileset.png");

    // 타일맵 불러오기
    this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
}

function create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.players = this.add.group();
    this.socket = io();

    var myPlayer;

    // UI
    this.timerText = this.add.text(120, 60, "앙Gㅗ띠II!@#", {
        fontFamily: '"NanumGothic"',
        fontSize: "64px"
    });

    // 타이머
    this.timer = this.time.addEvent({
        delay: 1000,
        callback: () => {
            console.log("ALERT");
        },
        callbackScope: this,
        loop: true
    });

    // 핑 보내기
    var startTime, latency;
    setInterval(() => {
        startTime = Date.now();
        this.socket.emit("latency");
    }, 1000);

    // (나를 포함한)서버에 있는 모든 플레이어 정보 받아오기
    this.socket.on("currentPlayers", (players) => {
        Object.keys(players).forEach((id) => {
            var playerInfo = players[id];

            if (playerInfo.playerId === this.socket.id) {
                // 카메라 플레이어 고정
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
            if (playerId === player.playerId) {
                player.destroy();
            }
        });
    });

    // 게임 업데이트
    this.socket.on("playerUpdates", (players) => {
        Object.keys(players).forEach((id) => {
            this.players.getChildren().forEach((player) => {
                if (players[id].playerId === player.playerId) {
                    player.setPosition(players[id].x, players[id].y);
                }
            });
        });
    });

    // 핑 확인
    this.socket.on("latency", () => {
        latency = Date.now() - startTime;
    });

    // 맵 불러오기
    var map = this.make.tilemap({ key: "map" });
    var tileset = map.addTilesetImage("tileset", "tiles");
    var worldLayer = map.createStaticLayer("world", tileset, 0, 0);
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
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}
