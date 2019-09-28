const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // 스프라이트 불러오기
    this.load.image("player", "assets/sprites/player.png");

    // 타일셋 불러오기
    this.load.image("tiles", "assets/tilesets/four-seasons-tileset.png");

    // 타일맵 불러오기
    this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
}

function create() {
    this.socket = io();
    this.players = this.add.group();
    let player;
    this.cursors = this.input.keyboard.createCursorKeys();

    // (나를 포함한)서버에 있는 모든 플레이어 정보 받아오기
    this.socket.on("currentPlayers", (players) => {
        Object.keys(players).forEach((id) => {
            let playerInfo = players[id];

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

    // 맵 불러오기
    let map = this.make.tilemap({ key: "map" });
    let tileset = map.addTilesetImage("tileset", "tiles");
    let worldLayer = map.createStaticLayer("world", tileset, 0, 0);
}

function update() {
    // 플레이어 이동
    let left = this.cursors.left.isDown;
    let right = this.cursors.right.isDown;
    let up = this.cursors.up.isDown;

    if (left || right || up) {
        this.socket.emit("playerInput", {
            left: left,
            right: right,
            up: up
        });
    }
}

function addPlayer(self, playerInfo) {
    let player = self.add
        .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
        .setOrigin(0.5, 0.5);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}
