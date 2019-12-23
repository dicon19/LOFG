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
                y: 800
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
    this.load.image("bullet", "assets/sprites/spr_bullet.png");
    this.load.image("item_weapon_rapid", "assets/sprites/spr_item_weapon_rapid.png");
    this.load.image("item_heal", "assets/sprites/spr_item_heal.png");
    this.load.image("tileset", "assets/tilesets/tile_tileset.png");

    this.load.tilemapTiledJSON("tilemap1", "assets/tilemaps/map_tilemap1.json");
    this.load.tilemapTiledJSON("tilemap2", "assets/tilemaps/map_tilemap2.json");
    this.load.tilemapTiledJSON("tilemap3", "assets/tilemaps/map_tilemap3.json");
    this.load.tilemapTiledJSON("tilemap4", "assets/tilemaps/map_tilemap4.json");
    this.load.tilemapTiledJSON("tilemap5", "assets/tilemaps/map_tilemap5.json");
    this.load.tilemapTiledJSON("tilemap6", "assets/tilemaps/map_tilemap6.json");
    this.load.tilemapTiledJSON("tilemap7", "assets/tilemaps/map_tilemap7.json");
}

function create() {
    this.players = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.items = this.physics.add.group();

    // 제한시간 타이머
    this.timer = "02:00";
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
                // 타임오버
                min = 2;
                sec = 0;
                timeOver(this);
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

    this.itemAlarm = this.time.addEvent({
        delay: 5000,
        callback: () => {
            createItem(this);
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
                x: irandom_range(100, this.map.widthInPixels - 100),
                y: 0,
                name: name,
                sprite: skin,
                score: 0,
                hpMax: 100,
                hp: 100,
                weapon: "weapon",
                isWeaponRapid: false,
                isMove: false,
                isWall: false,
                flipX: false
            };
            createPlayer(this, INSTANCES[socket.id]);
            socket.emit("currentGame", INSTANCES, this.currentMap);
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
                    if (inputData.left != inputData.right && !player.isKnockback) {
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
                            x: player.x + (player.flipX ? -40 : 40),
                            y: player.y + 6 + irandom_range(-4, 4),
                            sprite: "bullet",
                            attackAt: player.instanceId,
                            flipX: player.flipX
                        };
                        player.isAttack = false;
                        player.attackAlarm = this.time.addEvent({
                            delay: player.attackDelayTime,
                            callback: () => {
                                player.isAttack = true;
                            }
                        });
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
                    if (player.jumpCount > 0 && !player.isKnockback) {
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
                        player.isDown = true;
                        player.downAlarm = this.time.addEvent({
                            delay: 300,
                            callback: () => {
                                player.isDown = false;
                            }
                        });
                    }
                }
            });
        });

        // 핑 보내기
        socket.on("latency", () => {
            socket.emit("latency");
        });
    });

    // 맵 초기화
    this.maps = ["tilemap1", "tilemap2", "tilemap3", "tilemap4", "tilemap5", "tilemap6", "tilemap7"];
    this.mapIndex = 0;
    shuffle(this.maps);
    createMap(this);
}

function update() {
    // 플레이어 업데이트
    this.players.getChildren().forEach((player) => {
        const PLAYER_INFO = INSTANCES[player.instanceId];
        PLAYER_INFO.x = player.x;
        PLAYER_INFO.y = player.y;
        PLAYER_INFO.score = player.score;
        PLAYER_INFO.hp = player.hp;
        PLAYER_INFO.isWeaponRapid = player.isWeaponRapid;
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

        // 추락사
        if (
            (player.x < 0 || player.x > this.map.widthInPixels || player.y > this.map.heightInPixels) &&
            !Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, player.getBounds())
        ) {
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

    // 아이템 업데이트
    this.items.getChildren().forEach((item) => {
        const ITEM_INFO = INSTANCES[item.instanceId];
        ITEM_INFO.x = item.x;
        ITEM_INFO.y = item.y;

        if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, item.getBounds())) {
            destroyItem(item);
        }
    });

    // 모든 인스턴스 정보 보내기
    io.emit("instanceUpdates", INSTANCES);
}

function playerReset(player) {
    player.hp = player.hpMax;
    player.moveSpeed = player.moveSpeedMax;
    player.jumpPower = player.jumpPowerMax;
    player.jumpCount = player.jumpCountMax;
    player.attackDelayTime = player.attackDelayTimeMax;
    player.deadAt = null;
    player.isWeaponRapid = false;
    player.isWall = false;
    player.isDown = false;
    player.isAttack = true;
    player.isKnockback = false;

    if (player.attackAlarm != undefined) {
        player.attackAlarm.remove();
    }

    if (player.weaponRapidAlarm != undefined) {
        player.weaponRapidAlarm.remove();
    }
}

function createPlayer(scene, playerInfo) {
    const PLAYER = scene.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite);
    scene.players.add(PLAYER);

    PLAYER.body.setBounce(0, 0);
    PLAYER.body.setDragX(0.9);
    PLAYER.body.maxVelocity.y = 600;
    PLAYER.body.useDamping = true;

    PLAYER.instanceId = playerInfo.instanceId;
    PLAYER.score = playerInfo.score;
    PLAYER.weapon = playerInfo.weapon;
    PLAYER.hpMax = playerInfo.hpMax;
    PLAYER.moveSpeedMax = 300;
    PLAYER.jumpPowerMax = 400;
    PLAYER.jumpCountMax = 2;
    PLAYER.attackDelayTimeMax = 200;
    playerReset(PLAYER);
}

function createBullet(scene, bulletInfo) {
    const BULLET = scene.physics.add.sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite);
    scene.bullets.add(BULLET);

    BULLET.body.setVelocityX(!bulletInfo.flipX ? 800 : -800);
    BULLET.body.allowGravity = false;

    BULLET.instanceId = bulletInfo.instanceId;
    BULLET.attackAt = bulletInfo.attackAt;
    BULLET.flipX = bulletInfo.flipX;
    BULLET.damage = 5;
}

function playerDead(scene, player) {
    if (player.deadAt != null) {
        scene.players.getChildren().forEach((_player) => {
            if (player.deadAt == _player.instanceId) {
                let hpHeal = 20;

                if (_player.hp + hpHeal > _player.hpMax) {
                    _player.hp = _player.hpMax;
                } else {
                    _player.hp += hpHeal;
                }
                _player.score++;
            }
        });
    } else if (player.score > 0) {
        // 자살 페널티
        player.score--;
    }
    player.body.reset(irandom_range(100, scene.map.widthInPixels - 100), 100);
    playerReset(player);
    io.emit("playerDead", INSTANCES[player.instanceId]);
}

function destroyBullet(bullet) {
    bullet.destroy();
    delete INSTANCES[bullet.instanceId];
    io.emit("destroyBullet", bullet.instanceId);
}

function createItem(scene) {
    const ID = uuidgen();
    INSTANCES[ID] = {
        instanceId: ID,
        instanceType: "item",
        x: irandom_range(100, scene.map.widthInPixels - 100),
        y: 0,
        sprite: choose(["item_weapon_rapid", "item_heal"])
    };
    const ITEM = scene.physics.add.sprite(INSTANCES[ID].x, INSTANCES[ID].y, INSTANCES[ID].sprite);
    scene.items.add(ITEM);

    ITEM.body.maxVelocity.y = 600;
    ITEM.instanceId = INSTANCES[ID].instanceId;
    ITEM.sprite = INSTANCES[ID].sprite;
    ITEM.destroyAlarm = scene.time.addEvent({
        delay: 20000,
        callback: () => {
            destroyItem(ITEM);
        }
    });
    io.emit("addItem", INSTANCES[ID]);
}

function destroyItem(item) {
    item.destroy();
    delete INSTANCES[item.instanceId];
    io.emit("destroyItem", item.instanceId);
}

function createMap(scene) {
    scene.currentMap = scene.maps[scene.mapIndex];
    scene.physics.world.colliders.destroy();

    scene.map = scene.make.tilemap({ key: scene.currentMap });
    scene.tileset = scene.map.addTilesetImage("tileset");
    scene.wallLayer = scene.map.createStaticLayer("wall", scene.tileset);
    scene.platformLayer = scene.map.createStaticLayer("platform", scene.tileset);
    scene.wallLayer.setCollisionByProperty({ solid: true });
    scene.platformLayer.setCollisionByProperty({ solid: true });
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);

    // 충돌 설정
    scene.physics.add.collider(scene.players, scene.wallLayer);
    scene.physics.add.collider(
        scene.players,
        scene.platformLayer,
        null,
        (player, platform) => {
            if (player.y < platform.y * 32 && !player.isDown) {
                return true;
            }
        },
        scene
    );
    scene.physics.add.overlap(scene.players, scene.bullets, (player, bullet) => {
        if (player.instanceId != bullet.attackAt) {
            player.body.setVelocityX(!bullet.flipX ? 400 : -400);
            player.body.setVelocityY(-200);
            player.deadAt = bullet.attackAt;
            player.isKnockback = true;

            if (player.knockbackAlarm != undefined) {
                player.knockbackAlarm.remove();
            }
            player.knockbackAlarm = scene.time.addEvent({
                delay: 200,
                callback: () => {
                    player.isKnockback = false;
                }
            });
            destroyBullet(bullet);

            if (player.hp > bullet.damage) {
                player.hp -= bullet.damage;
            } else {
                playerDead(scene, player);
            }
        }
    });
    scene.physics.add.collider(scene.bullets, scene.wallLayer, (bullet) => {
        destroyBullet(bullet);
    });
    scene.physics.add.collider(scene.items, scene.wallLayer);
    scene.physics.add.collider(scene.items, scene.platformLayer);
    scene.physics.add.overlap(scene.players, scene.items, (player, item) => {
        switch (item.sprite) {
            case "item_weapon_rapid":
                player.attackDelayTime = player.attackDelayTimeMax / 3;
                player.isWeaponRapid = true;

                if (player.weaponRapidAlarm != undefined) {
                    player.weaponRapidAlarm.remove();
                }
                player.weaponRapidAlarm = scene.time.addEvent({
                    delay: 8000,
                    callback: () => {
                        player.attackDelayTime = player.attackDelayTimeMax;
                        player.isWeaponRapid = false;
                    }
                });
                break;
            case "item_heal":
                player.hp = player.hpMax;
                break;
        }
        destroyItem(item);
        io.emit("getItem", player.instanceId, item.sprite);
    });
}

function timeOver(scene) {
    if (scene.mapIndex < scene.maps.length - 1) {
        scene.mapIndex++;
    } else {
        shuffle(scene.maps);
        scene.mapIndex = 0;
    }
    scene.players.getChildren().forEach((player) => {
        player.body.reset(irandom_range(100, scene.map.widthInPixels - 100), 100);
        playerReset(player);
    });
    scene.bullets.getChildren().forEach((bullet) => {
        destroyBullet(bullet);
    });
    scene.items.getChildren().forEach((item) => {
        destroyItem(item);
    });
    createMap(scene);
    io.emit("timeOver", scene.currentMap);
}

function choose(a) {
    return a[Math.floor(Math.random() * a.length)];
}

function irandom_range(a, b) {
    return a + Math.floor(Math.random() * (b + (a < 0 ? Math.abs(a) : 0) + 1));
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function uuidgen() {
    function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

window.gameLoaded();
