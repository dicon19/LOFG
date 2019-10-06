const players = {};

const config = {
    autoFocus: false,
    type: Phaser.HEADLESS,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 500
            }
        }
    }
};

const game = new Phaser.Game(config);

// Phaser 3.19.0 헤드리스 오류 수정
function WebGLTexture() {}

function preload() {
    // 리소스 불러오기
    this.load.image("player1", "assets/sprites/player1.png");
    this.load.image("player2", "assets/sprites/player2.png");
    this.load.image("player3", "assets/sprites/player3.png");
    this.load.image("tiles", "assets/tilesets/four-seasons-tileset.png");

    this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
}

function create() {
    this.players = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // 타이머
    this.timer = "10:00";
    this.timerAlarm = this.time.addEvent({
        delay: 1000,
        callback: () => {
            let min = Number(this.timer.substr(0, 2));
            let sec = Number(this.timer.substr(3, 2));

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
        },
        loop: true
    });

    io.on("connection", (socket) => {
        // 새로운 플레이어 접속
        console.log("a user connected");
        players[socket.id] = {
            playerId: socket.id,
            x: Math.floor(Math.random() * 1280),
            y: 0,
            sprite: choose(["player1", "player2", "player3"]),
            isMove: false,
            flipX: false
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
                if (socket.id == player.playerId) {
                    if (inputData.left) {
                        player.body.setVelocityX(-200);
                        player.flipX = true;
                    } else if (inputData.right) {
                        player.body.setVelocityX(200);
                        player.flipX = false;
                    }

                    if (inputData.up && player.body.onFloor()) {
                        player.body.setVelocityY(-500);
                    }

                    if (inputData.attack) {
                    }
                }
            });
        });

        // 핑 보내기
        socket.on("latency", () => {
            socket.emit("latency");
        });
    });

    // 맵 불러오기
    this.map = this.make.tilemap({ key: "map" });
    this.tileset = this.map.addTilesetImage("tileset", "tiles");
    this.worldLayer = this.map.createStaticLayer("world", this.tileset, 0, 0);
    this.worldLayer.setCollisionByProperty({ solid: true });
    this.physics.add.collider(this.players, this.worldLayer);
}

function update() {
    // 플레이어 업데이트
    this.players.getChildren().forEach((player) => {
        const playerInfo = players[player.playerId];
        playerInfo.x = player.x;
        playerInfo.y = player.y;
        playerInfo.isMove = Math.abs(player.body.velocity.x) > 20;
        playerInfo.flipX = player.flipX;
    });
    io.emit("playerUpdates", players);
}

function addPlayer(self, playerInfo) {
    const player = self.physics.add
        .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
        .setOrigin(0.5, 0.5);
    self.players.add(player);
    player.body.setBounce(0, 0.15);
    player.body.setCollideWorldBounds(true);
    player.body.setDragX(0.95);
    player.body.useDamping = true;
    player.playerId = playerInfo.playerId;
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId == player.playerId) {
            player.destroy();
        }
    });
}

function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

window.gameLoaded();
