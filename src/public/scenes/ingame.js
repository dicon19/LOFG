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
        this.enemyArrows = this.add.group();

        // 핑 보내기
        let startTime;
        setInterval(() => {
            startTime = Date.now();
            this.socket.emit("latency");
        }, 1000);

        // 배경 초기화
        this.cameras.main.setBackgroundColor("#a3cca3");

        // #region UI
        // 게임 제한 시간 타이머
        this.timerBox = this.add
            .graphics()
            .setDepth(100)
            .setScrollFactor(0);
        this.timerBox.fillStyle(0x808080, 0.8);
        this.timerBox.fillRoundedRect(40, 70, 230, 65, 30);
        this.timer = this.add
            .sprite(80, 100, "timer")
            .setDepth(100)
            .setScrollFactor(0);
        this.timerText = this.add
            .text(120, 75, "00:00", {
                fontFamily: "NanumGothic",
                fontSize: "48px"
            })
            .setDepth(100)
            .setScrollFactor(0);

        this.add.sprite(50, 50, "enemyArrow").setScrollFactor(0);

        // 핑
        this.ping = this.add
            .sprite(360, 100, "ping")
            .setDepth(100)
            .setScrollFactor(0);
        this.pingText = this.add
            .text(390, 85, "0", {
                fontFamily: "NanumGothic",
                fontSize: "28px"
            })
            .setDepth(100)
            .setScrollFactor(0);

        // 랭킹
        this.leaderboardText = this.add
            .text(1110, 70, "Leaderboard", {
                fontFamily: "NanumGothic",
                fontSize: "18px"
            })
            .setDepth(100)
            .setScrollFactor(0);
        this.rankingText = this.add
            .text(1080, 100, "", {
                fontFamily: "NanumGothic",
                fontSize: "12px"
            })
            .setDepth(100)
            .setScrollFactor(0);
        this.rankingScoreText = this.add
            .text(1240, 100, "", {
                fontFamily: "NanumGothic",
                fontSize: "12px",
                rtl: true
            })
            .setDepth(100)
            .setScrollFactor(0);
        // #endregion

        // #region 소켓 수신
        // 모든 인스턴스 정보 받기
        this.socket.on("currentInstances", (instances) => {
            Object.keys(instances).forEach((id) => {
                const INSTANCE_INFO = instances[id];

                switch (INSTANCE_INFO.instanceType) {
                    case "player":
                        this.createPlayer(INSTANCE_INFO, INSTANCE_INFO.instanceId == this.socket.id);
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
                    player.text.destroy();
                    player.hpBox.destroy();
                    player.hpBar.destroy();
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
                                player.dx = INSTANCE_INFO.x;
                                player.dy = INSTANCE_INFO.y;
                                player.score = INSTANCE_INFO.score;
                                player.hp = INSTANCE_INFO.hp;

                                if (INSTANCE_INFO.isMove) {
                                    player.anims.play(INSTANCE_INFO.sprite + "_move", true);
                                } else {
                                    player.anims.play(INSTANCE_INFO.sprite + "_idle", true);
                                }
                                player.flipX = INSTANCE_INFO.flipX;
                            }
                        });
                        break;
                    case "bullet":
                        this.bullets.getChildren().forEach((bullet) => {
                            if (INSTANCE_INFO.instanceId == bullet.instanceId) {
                                bullet.dx = INSTANCE_INFO.x;
                                bullet.dy = INSTANCE_INFO.y;
                            }
                        });
                        break;
                }
            });
        });

        // 타이머 시간 받기
        this.socket.on("getTimer", (timer) => {
            this.timerText.setText(timer);
        });

        // 핑 받기
        this.socket.on("latency", () => {
            const LATENCY = Date.now() - startTime;
            this.pingText.setText(LATENCY);

            if (LATENCY <= 100) {
                this.ping.setTint(0x00ff7b);
            } else if (LATENCY <= 150) {
                this.ping.setTint(0xffff00);
            } else {
                this.ping.setTint(0xff0000);
            }
        });
        // #endregion

        // 맵 불러오기
        this.map = this.make.tilemap({ key: "map1" });
        this.tileset = this.map.addTilesetImage("tileset1");
        this.worldLayer = this.map.createStaticLayer("world", this.tileset, 0, 0);
        this.worldLayer.setDepth(-100);

        // 카메라 초기화
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    update() {
        // 위치 보간
        this.players.getChildren().forEach((player) => {
            player.x += (player.dx - player.x) * 0.5;
            player.y += (player.dy - player.y) * 0.5;
        });
        this.bullets.getChildren().forEach((bullet) => {
            bullet.x += (bullet.dx - bullet.x) * 0.5;
            bullet.y += (bullet.dy - bullet.y) * 0.5;
        });

        // #region UI
        // 랭킹
        let ranking = "";
        let rankingScore = "";
        let rankings = this.players.getChildren();
        rankings.sort((a, b) => {
            return b["score"] - a["score"];
        });

        for (let i = 0; i < Math.min(rankings.length, 10); i++) {
            ranking += "#" + (i + 1) + "  " + rankings[i].name + "\n";
            rankingScore += rankings[i].score + "\n";
        }
        this.rankingText.setText(ranking);
        this.rankingScoreText.setText(rankingScore);

        // 플레이어
        this.players.getChildren().forEach((player) => {
            player.text.setText("[" + player.score + "] " + player.name);
            player.text.setPosition(player.x, player.y - 42);

            player.hpBox.clear();
            player.hpBox.fillStyle(0xffffff, 0.8);
            player.hpBox.fillRect(player.x - 24, player.y - 28, 48, 12);

            player.hpBar.clear();
            player.hpBar.fillStyle(player.instanceId == this.socket.id ? 0x00ff00 : 0xff0000, 0.8);
            player.hpBar.fillRect(player.x - 24, player.y - 28, (player.hp / player.hpMax) * 48, 12);
        });
        // #endregion

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

        let myPlayer;
        this.players.getChildren().forEach((player) => {
            if (player.instanceId == this.socket.id) {
                myPlayer = player;
            }
        });

        this.players.getChildren().forEach((player) => {
            this.enemyArrows.getChildren().forEach((arrow) => {
                let dir = Phaser.Math.Angle.Between(myPlayer.x, myPlayer.y, player.x, player.y);

                console.log(Phaser.Math.RadToDeg(dir));

                if (this.socket.id == player.instanceId) {
                    arrow.x = myPlayer.x + Math.cos(Phaser.Math.RadToDeg(dir)) * 60;
                    arrow.y = myPlayer.y + Math.sin(Phaser.Math.RadToDeg(dir)) * 60;
                }
                if (arrow.instanceId == player.instanceId) {
                    //각도 처리
                    arrow.setAngle(Phaser.Math.RadToDeg(dir));
                }
            });
        });
    }

    createPlayer(playerInfo, isMyPlayer) {
        const PLAYER = this.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite).setOrigin(0.5, 0.5);
        this.players.add(PLAYER);

        PLAYER.instanceId = playerInfo.instanceId;
        PLAYER.dx = playerInfo.x;
        PLAYER.dy = playerInfo.y;
        PLAYER.name = playerInfo.name;
        PLAYER.score = playerInfo.score;
        PLAYER.hpMax = playerInfo.hpMax;
        PLAYER.hp = playerInfo.hp;

        // 플레이어 UI
        PLAYER.text = this.add
            .text(playerInfo.x, playerInfo.y - 42, "[" + playerInfo.score + "] " + playerInfo.name, {
                fontFamily: "NanumGothic",
                fontSize: "14px"
            })
            .setOrigin(0.5, 0.5);
        PLAYER.hpBox = this.add.graphics();
        PLAYER.hpBar = this.add.graphics();

        // 플레이어 시점 카메라 고정
        if (isMyPlayer) {
            this.cameras.main.startFollow(PLAYER, true, 0.1, 0.1);
        } else {
            const ENEMY_ARROW = this.add.sprite(50, 50, "enemyArrow");
            this.enemyArrows.add(ENEMY_ARROW);
            ENEMY_ARROW.instanceId = playerInfo.instanceId;
        }
    }

    createBullet(bulletInfo) {
        const BULLET = this.add.sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite).setOrigin(0.5, 0.5);
        this.bullets.add(BULLET);

        BULLET.instanceId = bulletInfo.instanceId;
        BULLET.dx = bulletInfo.x;
        BULLET.dy = bulletInfo.y;
        BULLET.flipX = bulletInfo.flipX;
    }
}
