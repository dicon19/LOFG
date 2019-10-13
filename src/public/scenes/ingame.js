class IngameScene extends Phaser.Scene {
    constructor() {
        super({ key: "ingameScene" });
    }

    create() {
        this.socket = io();
        this.socket.emit("ingame", name, skin);

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

        // TODO 스코어 보드 구현

        // 핑 보내기
        let startTime;
        setInterval(() => {
            startTime = Date.now();
            this.socket.emit("latency");
        }, 1000);

        // 모든 인스턴스 정보 받기
        this.socket.on("currentInstances", (instances) => {
            Object.keys(instances).forEach((id) => {
                const INSTANCE_INFO = instances[id];
                switch (INSTANCE_INFO.instanceType) {
                    case "player":
                        this.createPlayer(
                            INSTANCE_INFO,
                            INSTANCE_INFO.instanceId == this.socket.id
                        );
                        break;
                    case "bullet":
                        this.createBullet(INSTANCE_INFO);
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

        // 플레이어 총알 파괴
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
                const INSTANCE_INFO = instances[id];

                switch (INSTANCE_INFO.instanceType) {
                    case "player":
                        this.players.getChildren().forEach((player) => {
                            if (INSTANCE_INFO.instanceId == player.instanceId) {
                                player.setPosition(INSTANCE_INFO.x, INSTANCE_INFO.y);
                                player.flipX = INSTANCE_INFO.flipX;

                                if (INSTANCE_INFO.isMove) {
                                    player.anims.play(INSTANCE_INFO.sprite + "_walk", true);
                                } else {
                                    player.anims.play(INSTANCE_INFO.sprite + "_idle", true);
                                }
                            }
                        });
                        break;
                    case "bullet":
                        this.bullets.getChildren().forEach((bullet) => {
                            if (INSTANCE_INFO.instanceId == bullet.instanceId) {
                                bullet.setPosition(INSTANCE_INFO.x, INSTANCE_INFO.y);
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
        this.socket.on("getTimer", (timer) => {
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
        const LEFT = this.cursors.left.isDown;
        const RIGHT = this.cursors.right.isDown;
        const UP = this.cursors.up.isDown;
        const ATTACK = this.cursors.space.isDown;

        if (LEFT || RIGHT || UP || ATTACK) {
            this.socket.emit("playerInput", {
                left: LEFT,
                right: RIGHT,
                up: UP,
                attack: ATTACK
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

            // TODO 카메라 처리
            // TODO 이름, 체력바, 점수 UI 구현
        } else {
            const PLAYER = this.add
                .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
                .setOrigin(0.5, 0.5);
            this.players.add(PLAYER);
            PLAYER.instanceId = playerInfo.instanceId;
        }
    }

    createBullet(bulletInfo) {
        const BULLET = this.add
            .sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite)
            .setOrigin(0.5, 0.5);
        this.bullets.add(BULLET);
        BULLET.flipX = bulletInfo.flipX;
        BULLET.instanceId = bulletInfo.instanceId;
    }
}
