let players = {};

const config = {
    autoFocus: false,
    type: Phaser.HEADLESS,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 300
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Phaser 3.19.0 헤드리스 오류 수정
function WebGLTexture() {}

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
    this.players = this.physics.add.group();

    io.on("connection", (socket) => {
        // 새로운 플레이어 접속
        console.log("a user connected");
        players[socket.id] = {
            playerId: socket.id,
            x: Math.floor(Math.random() * 1280),
            y: 0,
            sprite: "player"
        };
        addPlayer(this, players[socket.id]);
        socket.emit("currentPlayers", players);
        socket.broadcast.emit("newPlayer", players[socket.id]);

        // 플레이어 접속 끊김
        socket.on("disconnect", () => {
            console.log("user disconnected");
            removePlayer(this, socket.id);
            delete players[socket.id];
            io.emit("disconnect", socket.id);
        });

        // 플레이어 움직임
        socket.on("playerInput", (inputData) => {
            this.players.getChildren().forEach((player) => {
                if (socket.id === player.playerId) {
                    if (inputData.left) {
                        player.body.setVelocityX(-200);
                    }
                    if (inputData.right) {
                        player.body.setVelocityX(200);
                    }
                    if (inputData.up && player.body.onFloor()) {
                        player.body.setVelocityY(-500);
                    }
                }
            });
        });
    });

    // 맵 불러오기
    let map = this.make.tilemap({ key: "map" });
    let tileset = map.addTilesetImage("tileset", "tiles");
    let worldLayer = map.createStaticLayer("world", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ solid: true });
    this.physics.world.bounds.width = worldLayer.width;
    this.physics.world.bounds.height = worldLayer.height;
    this.physics.add.collider(this.players, worldLayer);
}

function update() {
    // 플레이어 업데이트
    this.players.getChildren().forEach((player) => {
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
    });
    io.emit("playerUpdates", players);
}

function addPlayer(self, playerInfo) {
    let player = self.physics.add
        .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
        .setOrigin(0.5, 0.5)
        .setBounce(0.2)
        .setCollideWorldBounds(true);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}

window.gameLoaded();
