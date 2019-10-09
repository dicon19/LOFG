class IngameScene extends Phaser.Scene {
    constructor() {
        super({ key: "ingameScene" });
    }

    create() {
        this.socket = io();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.players = this.add.group();
        this.bullets = this.add.group();

        // UI
        this.timerText = this.add.text(120, 60, "", {
            fontFamily: '"NanumGothic"',
            fontSize: "64px"
        });

        this.pingText = this.add.text(340, 60, "", {
            fontFamily: '"NanumGothic"',
            fontSize: "32px"
        });

        // 핑 보내기
        let startTime;
        setInterval(() => {
            startTime = Date.now();
            this.socket.emit("latency");
        }, 1000);

        // 모든 인스턴스 정보 받기
        this.socket.on("currentInstances", (instances) => {
            Object.keys(instances).forEach((id) => {
                const instanceInfo = instances[id];

                switch (instanceInfo.instanceType) {
                    case "player":
                        this.createPlayer(instanceInfo, instanceInfo.instanceId == this.socket.id);
                        break;
                    case "bullet":
                        this.createBullet(instanceInfo);
                        break;
                }
            });
        });

        // 플레이어 접속 끊김
        this.socket.on("disconnect", (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId == player.instanceId) {
                    player.destroy();
                }
            });
        });

        // 새로운 플레이어 접속
        this.socket.on("addPlayer", (playerInfo) => {
            this.createPlayer(playerInfo, false);
        });

        // 플레이어 총알 발사
        this.socket.on("addBullet", (bulletInfo) => {
            this.createBullet(bulletInfo);
        });

        // 총알 파괴 이벤트
        this.socket.on("destroyBullet", (bulletId) => {
            this.bullets.getChildren().forEach((bullet) => {
                if (bulletId == bullet.instanceId) {
                    bullet.destroy();
                }
            });
        });

        // 모든 인스턴스 업데이트
        this.socket.on("instanceUpdates", (instances) => {
            Object.keys(instances).forEach((id) => {
                const instanceInfo = instances[id];

                switch (instanceInfo.instanceType) {
                    case "player":
                        this.players.getChildren().forEach((player) => {
                            if (instanceInfo.instanceId == player.instanceId) {
                                // 위치 설정
                                player.setPosition(instanceInfo.x, instanceInfo.y);

                                // 애니메이션 설정
                                if (instanceInfo.isMove) {
                                    player.anims.play(instanceInfo.sprite + "_walk", true);
                                } else {
                                    player.anims.play(instanceInfo.sprite + "_idle", true);
                                }

                                // 좌우반전 설정
                                player.flipX = instanceInfo.flipX;
                            }
                        });
                        break;
                    case "bullet":
                        this.bullets.getChildren().forEach((bullet) => {
                            if (instanceInfo.instanceId == bullet.instanceId) {
                                // 위치 설정
                                bullet.setPosition(instanceInfo.x, instanceInfo.y);
                            }
                        });
                        break;
                }
            });
        });

        // 핑 확인
        this.socket.on("latency", () => {
            this.pingText.setText(Date.now() - startTime);
        });

        // 시간 불러오기
        this.socket.on("setTimer", (timer) => {
            this.timerText.setText(timer);
        });

        // 맵 불러오기
        this.map = this.make.tilemap({ key: "map" });
        this.tileset = this.map.addTilesetImage("tileset", "tiles");
        this.worldLayer = this.map.createStaticLayer("world", this.tileset, 0, 0);
        this.worldLayer.setDepth(-100);
    }

    update() {
        // 플레이어 이동 | 공격
        const left = this.cursors.left.isDown;
        const right = this.cursors.right.isDown;
        const up = this.cursors.up.isDown;
        const attack = this.cursors.space.isDown;

        if (left || right || up || attack) {
            this.socket.emit("playerInput", {
                left: left,
                right: right,
                up: up,
                attack: attack
            });
        }
    }

    createPlayer(playerInfo, isMyPlayer) {
        if (isMyPlayer) {
            this.myPlayer = this.add
                .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
                .setOrigin(0.5, 0.5);
            this.players.add(this.myPlayer);
            this.myPlayer.instanceId = playerInfo.instanceId;
        } else {
            const player = this.add
                .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
                .setOrigin(0.5, 0.5);
            this.players.add(player);
            player.instanceId = playerInfo.instanceId;
        }
    }

    createBullet(bulletInfo) {
        const bullet = this.add
            .sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite)
            .setOrigin(0.5, 0.5);
        this.bullets.add(bullet);
        bullet.flipX = bulletInfo.flipX;
        bullet.instanceId = bulletInfo.instanceId;
    }
}
