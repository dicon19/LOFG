const instances = {};

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
    this.load.image("bullet", "assets/sprites/bullet.png");
    this.load.image("tiles", "assets/tilesets/four-seasons-tileset.png");

    this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
}

function create() {
    this.players = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // 게임 제한시간 타이머
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
        instances[socket.id] = {
            instanceId: socket.id,
            instanceType: "player",
            x: Math.floor(Math.random() * 1280),
            y: 0,
            sprite: choose(["player1", "player2", "player3"]),
            isMove: false,
            flipX: false
        };
        createPlayer(this, instances[socket.id]);
        socket.emit("currentInstances", instances);
        socket.broadcast.emit("addPlayer", instances[socket.id]);

        // 플레이어 접속 끊김
        socket.on("disconnect", () => {
            console.log("user disconnected");
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    player.destroy();
                }
            });
            delete instances[socket.id];
            io.emit("disconnect", socket.id);
        });

        // 플레이어 입력
        socket.on("playerInput", (inputData) => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    // 이동
                    if (inputData.left) {
                        player.body.setVelocityX(-200);
                        player.flipX = true;
                    } else if (inputData.right) {
                        player.body.setVelocityX(200);
                        player.flipX = false;
                    }

                    // 점프
                    if (inputData.up && player.body.onFloor()) {
                        player.body.setVelocityY(-500);
                    }

                    // 공격
                    if (inputData.attack) {
                        const id = uuidgen();
                        instances[id] = {
                            instanceId: id,
                            instanceType: "bullet",
                            x: player.x,
                            y: player.y,
                            sprite: "bullet",
                            flipX: player.flipX
                        };
                        createBullet(this, instances[id]);
                        io.emit("addBullet", instances[id]);
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
        const playerInfo = instances[player.instanceId];
        playerInfo.x = player.x;
        playerInfo.y = player.y;
        playerInfo.isMove = Math.abs(player.body.velocity.x) > 20;
        playerInfo.flipX = player.flipX;
    });

    // 총알 업데이트
    this.bullets.getChildren().forEach((bullet) => {
        const bulletInfo = instances[bullet.instanceId];
        bulletInfo.x = bullet.x;
        bulletInfo.y = bullet.y;
    });

    // 모든 인스턴스 정보 보내기
    io.emit("instanceUpdates", instances);
}

function createPlayer(self, playerInfo) {
    const player = self.physics.add
        .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
        .setOrigin(0.5, 0.5);
    self.players.add(player);
    player.body.setBounce(0, 0.15);
    player.body.setCollideWorldBounds(true);
    player.body.setDragX(0.95);
    player.body.useDamping = true;
    player.instanceId = playerInfo.instanceId;
}

function createBullet(self, bulletInfo) {
    const bullet = self.physics.add
        .sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite)
        .setOrigin(0.5, 0.5);
    self.bullets.add(bullet);
    bullet.body.velocity.x = !bulletInfo.flipX ? 100 : -100;
    bullet.instanceId = bulletInfo.instanceId;
}

function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function uuidgen() {
    function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

window.gameLoaded();
