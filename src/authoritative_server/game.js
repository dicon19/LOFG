let playerCount = 0;

const INSTANCES = {};

const CONFIG = {
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
                y: 700
            }
        }
    }
};
const GAME = new Phaser.Game(CONFIG);

// Phaser 3.19.0 헤드리스 오류 수정
function WebGLTexture() {}

function preload() {
    // 리소스 불러오기
    this.load.image("player1", "assets/sprites/spr_player1.png");
    this.load.image("player2", "assets/sprites/spr_player2.png");
    this.load.image("player3", "assets/sprites/spr_player3.png");
    this.load.image("player4", "assets/sprites/spr_player4.png");
    this.load.image("player5", "assets/sprites/spr_player5.png");
    this.load.image("player6", "assets/sprites/spr_player6.png");
    this.load.image("player7", "assets/sprites/spr_player7.png");
    this.load.image("player8", "assets/sprites/spr_player8.png");
    this.load.image("bullet1", "assets/sprites/spr_bullet1.png");
    this.load.image("tileset1", "assets/tilesets/tile_moon.png");

    this.load.tilemapTiledJSON("map1", "assets/tilemaps/map_moon1.json");
}

function create() {
    this.players = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // 게임 제한시간 타이머
    this.timer = "05:00";
    this.timerAlarm = this.time.addEvent({
        delay: 1000,
        callback: () => {
            let min = Number(this.timer.substr(0, 2));
            let sec = Number(this.timer.substr(3, 2));

            if (sec > 0) {
                sec--;
            } else if (min > 0) {
                min--;
                sec = 59;
            } else {
                // TODO 타임오버 이벤트 구현
                min = 5;
                sec = 0;
            }

            if (sec < 10) {
                sec = "0" + sec;
            }

            if (min < 10) {
                min = "0" + min;
            }
            this.timer = min + ":" + sec;
            io.emit("getTimer", this.timer);
        },
        loop: true
    });

    // 소켓 수신
    io.on("connection", (socket) => {
        socket.emit("getPlayers", playerCount);

        // 새로운 플레이어 접속
        socket.on("ingame", (name, skin) => {
            console.log("a player connected");
            playerCount++;
            io.emit("getPlayers", playerCount);

            INSTANCES[socket.id] = {
                instanceId: socket.id,
                instanceType: "player",
                x: 100 + Math.floor(Math.random() * this.map.widthInPixels - 100),
                y: 100,
                name: name,
                sprite: skin,
                score: 0,
                hpMax: 100,
                hp: 100,
                weapon: "weapon1",
                isMove: false,
                isWall: false,
                flipX: false
            };
            createPlayer(this, INSTANCES[socket.id]);
            socket.emit("currentInstances", INSTANCES);
            socket.broadcast.emit("addPlayer", INSTANCES[socket.id]);
        });

        // 플레이어 접속 끊김
        socket.on("disconnect", () => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    console.log("player disconnected");
                    playerCount--;
                    io.emit("getPlayers", playerCount);

                    player.destroy();
                    delete INSTANCES[socket.id];
                    io.emit("disconnect", socket.id);
                }
            });
        });

        // 플레이어 이동
        socket.on("playerMove", (inputData) => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    if (inputData.left != inputData.right) {
                        if (inputData.left) {
                            if (!player.isWall) {
                                player.flipX = true;
                            }
                            player.body.setVelocityX(-player.moveSpeed);
                        }

                        if (inputData.right) {
                            if (!player.isWall) {
                                player.flipX = false;
                            }
                            player.body.setVelocityX(player.moveSpeed);
                        }
                    }
                }
            });
        });

        // 플레이어 공격
        socket.on("playerAttack", () => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    if (player.isAttack) {
                        const ID = uuidgen();
                        INSTANCES[ID] = {
                            instanceId: ID,
                            instanceType: "bullet",
                            x: player.x,
                            y: player.y,
                            sprite: "bullet1",
                            attackAt: player.instanceId,
                            flipX: player.flipX
                        };
                        player.attackAlarm = this.time.addEvent({
                            delay: player.attackDelayTime,
                            callback: () => {
                                player.isAttack = true;
                            }
                        });
                        player.isAttack = false;
                        createBullet(this, INSTANCES[ID]);
                        io.emit("addBullet", INSTANCES[ID]);
                    }
                }
            });
        });

        // 플레이어 점프
        socket.on("playerJump", () => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    if (player.jumpCount > 0) {
                        player.body.setVelocityY(-player.jumpPower);
                        player.jumpCount--;
                        socket.emit("playerJump");
                    }
                }
            });
        });

        // 플레이어 플랫폼 내려가기
        socket.on("playerDown", () => {
            this.players.getChildren().forEach((player) => {
                if (socket.id == player.instanceId) {
                    if (!player.isDown && player.body.blocked.down) {
                        player.downAlarm = this.time.addEvent({
                            delay: 300,
                            callback: () => {
                                player.isDown = false;
                            }
                        });
                        player.isDown = true;
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
    this.map = this.make.tilemap({ key: "map1" });
    this.tileset = this.map.addTilesetImage("tileset1");
    this.worldLayer = this.map.createStaticLayer("world", this.tileset);
    this.worldLayer.setCollisionByProperty({ solid: true });
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // 충돌 설정
    this.physics.add.collider(
        this.players,
        this.worldLayer,
        null,
        (obj1, obj2) => {
            if (obj1.y < obj2.y * 32 && !obj1.isDown) {
                return true;
            } else {
                return false;
            }
        },
        this
    );
    this.physics.add.overlap(this.players, this.bullets, (player, bullet) => {
        if (player.instanceId != bullet.attackAt) {
            player.body.setVelocityX(bullet.knockbackPower * !bullet.flipX ? 500 : -500);
            player.body.setVelocityY(-200);
            player.deadAt = bullet.attackAt;
            destroyBullet(bullet);

            if (player.hp > bullet.damage) {
                player.hp -= bullet.damage;
            } else {
                playerDead(this, player);
            }
        }
    });
    this.physics.add.collider(this.bullets, this.worldLayer, (bullet) => {
        destroyBullet(bullet);
    });
}

function update() {
    // 플레이어 업데이트
    this.players.getChildren().forEach((player) => {
        const PLAYER_INFO = INSTANCES[player.instanceId];
        PLAYER_INFO.x = player.x;
        PLAYER_INFO.y = player.y;
        PLAYER_INFO.score = player.score;
        PLAYER_INFO.hp = player.hp;
        PLAYER_INFO.isMove = Math.abs(player.body.velocity.x) > 20;
        PLAYER_INFO.isWall = player.isWall;
        PLAYER_INFO.flipX = player.flipX;

        // 벽타기
        if ((player.body.blocked.left || player.body.blocked.right) && !player.body.blocked.down) {
            if (!player.isWall) {
                player.flipX = !player.flipX;
                player.isWall = true;
            }

            if (player.body.velocity.y > 0) {
                player.body.velocity.y /= 1.3;
            }
        } else {
            player.isWall = false;
        }

        // 벽점프
        if (player.isWall || player.body.blocked.down) {
            player.jumpCount = player.jumpCountMax;
        }

        if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, player.getBounds())) {
            playerDead(this, player);
        }
    });

    // 총알 업데이트
    this.bullets.getChildren().forEach((bullet) => {
        const BULLET_INFO = INSTANCES[bullet.instanceId];
        BULLET_INFO.x = bullet.x;
        BULLET_INFO.y = bullet.y;

        if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, bullet.getBounds())) {
            destroyBullet(bullet);
        }
    });

    // 모든 인스턴스 정보 보내기
    io.emit("instanceUpdates", INSTANCES);
}

function createPlayer(scene, playerInfo) {
    const PLAYER = scene.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite);
    scene.players.add(PLAYER);

    PLAYER.body.setBounce(0, 0);
    PLAYER.body.setDragX(0.9);
    PLAYER.body.setMaxSpeed(600);
    PLAYER.body.useDamping = true;

    PLAYER.instanceId = playerInfo.instanceId;
    PLAYER.score = playerInfo.score;
    PLAYER.hpMax = playerInfo.hpMax;
    PLAYER.hp = playerInfo.hp;
    PLAYER.weapon = playerInfo.weapon;
    PLAYER.deadAt = null;
    PLAYER.moveSpeed = 300;
    PLAYER.jumpPower = 400;
    PLAYER.jumpCountMax = 2;
    PLAYER.jumpCount = PLAYER.jumpCountMax;
    PLAYER.isWall = false;
    PLAYER.isDown = false;
    PLAYER.isAttack = true;
    PLAYER.attackDelayTime = 150;
}

function createBullet(scene, bulletInfo) {
    const BULLET = scene.physics.add.sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite);
    scene.bullets.add(BULLET);

    BULLET.body.setVelocityX(!bulletInfo.flipX ? 600 : -600);
    BULLET.body.setMaxSpeed(600);
    BULLET.body.allowGravity = false;

    BULLET.instanceId = bulletInfo.instanceId;
    BULLET.attackAt = bulletInfo.attackAt;
    BULLET.flipX = bulletInfo.flipX;
    BULLET.damage = 10;
    BULLET.knockbackPower = 1;
}

function destroyBullet(bullet) {
    bullet.destroy();
    delete INSTANCES[bullet.instanceId];
    io.emit("destroyBullet", bullet.instanceId);
}

function playerDead(scene, player) {
    if (player.deadAt != null) {
        scene.players.getChildren().forEach((_player) => {
            if (player.deadAt == _player.instanceId) {
                _player.score++;
            }
        });
        player.deadAt = null;
    } else if (player.score > 0) {
        // 자살 페널티
        player.score--;
    }
    player.body.reset(100 + Math.floor(Math.random() * scene.map.widthInPixels - 100), 100);
    player.hp = player.hpMax;
    io.emit("playerDead", INSTANCES[player.instanceId]);
}

function uuidgen() {
    function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

window.gameLoaded();
