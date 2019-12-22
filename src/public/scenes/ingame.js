class IngameScene extends Phaser.Scene {
    constructor() {
        super({ key: "ingameScene" });
    }

    create() {
        this.socket = io();
        this.socket.emit("ingame", name, skin);

        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor("#a3cca3");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.players = this.add.group();
        this.bullets = this.add.group();
        this.items = this.add.group();
        this.arrows = this.add.group();

        this.isMenu = false;

        // 핑 보내기
        this.latency = 0;
        setInterval(() => {
            this.latencyStart = Date.now();
            this.socket.emit("latency");
        }, 500);

        // #region UI
        // 제한시간 타이머
        this.timerBox = this.add
            .graphics()
            .setDepth(100)
            .setScrollFactor(0);
        this.timerBox.fillStyle(0x808080, 0.4);
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
            .text(1085, 70, "🏆Leaderboard🏆", {
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
        this.socket.on("currentGame", (instances, currentMap) => {
            Object.keys(instances).forEach((id) => {
                const INSTANCE_INFO = instances[id];

                switch (INSTANCE_INFO.instanceType) {
                    case "player":
                        this.createPlayer(INSTANCE_INFO);
                        break;
                    case "bullet":
                        this.createBullet(INSTANCE_INFO);
                        break;
                    case "item":
                        this.createItem(INSTANCE_INFO);
                        break;
                }
            });
            this.createMap(currentMap);
        });

        // 새로운 플레이어 접속
        this.socket.on("addPlayer", (playerInfo) => {
            this.createPlayer(playerInfo);
        });

        // 플레이어 접속 끊김
        this.socket.on("disconnect", (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId == player.instanceId) {
                    player.weapon.destroy();
                    player.text.destroy();
                    player.hpBox.destroy();
                    player.hpBar.destroy();
                    player.destroy();
                }
            });
            this.arrows.getChildren().forEach((arrow) => {
                if (playerId == arrow.targetId) {
                    arrow.destroy();
                }
            });
        });

        // 플레이어 총알 발사
        this.socket.on("addBullet", (bulletInfo) => {
            this.createBullet(bulletInfo);

            if (bulletInfo.attackAt == this.myPlayer.instanceId) {
                sfxAttack.play();
            }
        });

        // 플레이어 총알 파괴
        this.socket.on("destroyBullet", (bulletId) => {
            this.bullets.getChildren().forEach((bullet) => {
                if (bulletId == bullet.instanceId) {
                    bullet.destroy();
                }
            });
        });

        // 플레이어 점프
        this.socket.on("playerJump", () => {
            sfxPlayerJump.play();
        });

        // 플레이어 죽음
        this.socket.on("playerDead", (playerInfo) => {
            if (playerInfo.instanceId == this.myPlayer.instanceId) {
                sfxPlayerDead.play();
            }
        });

        // 아이템 드롭
        this.socket.on("addItem", (itemInfo) => {
            this.createItem(itemInfo);
        });

        // 아이템 파괴
        this.socket.on("destroyItem", (itemId) => {
            this.items.getChildren().forEach((item) => {
                if (itemId == item.instanceId) {
                    item.destroy();
                }
            });
            this.arrows.getChildren().forEach((arrow) => {
                if (itemId == arrow.targetId) {
                    arrow.destroy();
                }
            });
        });

        // 아이템 획득
        this.socket.on("getItem", (playerId, item) => {
            if (this.myPlayer.instanceId == playerId) {
                switch (item) {
                    case "item_weapon_rapid":
                        sfxHeavyMachineGun.play();
                        break;
                    case "item_heal":
                        sfxCoin.play();
                        break;
                }
            }
        });

        // 타임오버
        this.socket.on("timeOver", (currentMap) => {
            this.map.destroy();
            this.createMap(currentMap);

            if (!this.isMenu) {
                this.cameras.main.fadeIn(1000);
            }
        });

        // 타이머 시간 받기
        this.socket.on("getTimer", (timer) => {
            this.timerText.setText(timer);
        });

        // 핑 받기
        this.socket.on("latency", () => {
            this.latency = Date.now() - this.latencyStart;
            this.pingText.setText(this.latency);

            if (this.latency <= 100) {
                this.ping.setTint(0x00ff7b);
            } else if (this.latency <= 150) {
                this.ping.setTint(0xffff00);
            } else {
                this.ping.setTint(0xff0000);
            }
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
                                player.isWeaponRapid = INSTANCE_INFO.isWeaponRapid;

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
                    case "item":
                        this.items.getChildren().forEach((item) => {
                            if (INSTANCE_INFO.instanceId == item.instanceId) {
                                item.dx = INSTANCE_INFO.x;
                                item.dy = INSTANCE_INFO.y;
                            }
                        });
                        break;
                }
            });
        });
        // #endregion

        // 배경음악 재생
        bgmScheme.stop();
        shuffle(ingameBgm);
        ingameBgmIndex = 0;
        ingameBgm[ingameBgmIndex].play();
    }

    update() {
        // 일시정지
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (!this.isMenu) {
                this.menu = this.add
                    .graphics()
                    .setScrollFactor(0)
                    .setDepth(1000);
                this.menu.fillStyle(0x000000, 0.8);
                this.menu.fillRoundedRect(0, 0, 1280, 720, 0);

                this.logo = this.add
                    .sprite(640, 240, "logo")
                    .setScrollFactor(0)
                    .setDepth(2000);

                this.resume = new Button(this, 640, 460, "button_resume", () => {
                    this.menu.destroy();
                    this.logo.destroy();
                    this.resume.destroy();
                    this.exit.destroy();
                    this.isMenu = false;
                });
                this.resume.setScrollFactor(0);
                this.resume.setDepth(2000);

                this.exit = new Button(this, 640, 580, "button_exit", () => {
                    this.socket.disconnect();
                    this.scene.start("menuScene");
                });
                this.exit.setScrollFactor(0);
                this.exit.setDepth(2000);

                this.isMenu = true;
            } else {
                this.menu.destroy();
                this.logo.destroy();
                this.resume.destroy();
                this.exit.destroy();
                this.isMenu = false;
            }
        }

        // 위치 보간
        this.players.getChildren().forEach((player) => {
            this.tweens.add({
                targets: player,
                x: { value: player.dx },
                y: { value: player.dy },
                ease: "Linear",
                duration: this.latency
            });
        });
        this.bullets.getChildren().forEach((bullet) => {
            this.tweens.add({
                targets: bullet,
                x: { value: bullet.dx },
                y: { value: bullet.dy },
                ease: "Linear",
                duration: this.latency
            });
        });
        this.items.getChildren().forEach((item) => {
            this.tweens.add({
                targets: item,
                x: { value: item.dx },
                y: { value: item.dy },
                ease: "Linear",
                duration: this.latency
            });
        });

        // 랭킹
        let ranking = "";
        let rankingScore = "";
        let rankings = this.players.getChildren();
        rankings.sort((a, b) => {
            return b["score"] - a["score"];
        });

        for (let i = 0; i < Math.min(rankings.length, 9); i++) {
            ranking += "#" + (i + 1) + "  " + rankings[i].name + "\n";
            rankingScore += rankings[i].score + "\n";
        }
        this.rankingText.setText(ranking);
        this.rankingScoreText.setText(rankingScore);

        // 플레이어
        this.players.getChildren().forEach((player) => {
            player.weapon.setTexture(!player.isWeaponRapid ? "weapon" : "weapon_rapid");
            player.weapon.setPosition(player.x, player.y + 6);
            player.weapon.flipX = player.flipX;

            player.text.setText(
                (player.instanceId == rankings[0].instanceId ? "👑 " : "[" + player.score + "] ") + player.name
            );
            player.text.setPosition(player.x, player.y - 42);

            player.hpBox.clear();
            player.hpBox.fillStyle(0xffffff);
            player.hpBox.fillRect(player.x - 24, player.y - 28, 48, 12);

            player.hpBar.clear();
            player.hpBar.fillStyle(
                this.myPlayer != undefined
                    ? player.instanceId == this.myPlayer.instanceId
                        ? 0x00ff00
                        : 0xff0000
                    : 0xff0000
            );
            player.hpBar.fillRect(player.x - 24, player.y - 28, player.hpBar.dx, 12);
            this.tweens.add({
                targets: player.hpBar,
                dx: { value: (player.hp / player.hpMax) * 48 },
                ease: "Power4",
                duration: 300
            });
        });

        // 화살표
        this.players.getChildren().forEach((player) => {
            this.arrows.getChildren().forEach((arrow) => {
                if (player.instanceId == arrow.targetId) {
                    const DIR = Phaser.Math.Angle.Between(this.myPlayer.x, this.myPlayer.y, player.x, player.y);
                    arrow.setAngle(Phaser.Math.RadToDeg(DIR));
                    arrow.x = this.myPlayer.x + Math.cos(DIR) * 40;
                    arrow.y = this.myPlayer.y + Math.sin(DIR) * 40;
                }
            });
        });
        this.items.getChildren().forEach((item) => {
            this.arrows.getChildren().forEach((arrow) => {
                if (item.instanceId == arrow.targetId) {
                    const DIR = Phaser.Math.Angle.Between(this.myPlayer.x, this.myPlayer.y, item.x, item.y);
                    arrow.setAngle(Phaser.Math.RadToDeg(DIR));
                    arrow.x = this.myPlayer.x + Math.cos(DIR) * 40;
                    arrow.y = this.myPlayer.y + Math.sin(DIR) * 40;
                }
            });
        });

        // 키보드 입력
        if (!this.isMenu) {
            const LEFT = this.cursors.left.isDown;
            const RIGHT = this.cursors.right.isDown;
            const ATTACK = this.cursors.space.isDown;

            if (LEFT || RIGHT) {
                this.socket.emit("playerMove", {
                    left: LEFT,
                    right: RIGHT
                });
            }

            if (ATTACK) {
                this.socket.emit("playerAttack");
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.socket.emit("playerJump");
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.socket.emit("playerDown");
            }
        }

        // 배경음악 연속재생
        if (!ingameBgm[ingameBgmIndex].isPlaying) {
            if (ingameBgmIndex < ingameBgm.length - 1) {
                ingameBgmIndex++;
            } else {
                shuffle(ingameBgm);
                ingameBgmIndex = 0;
            }
            ingameBgm[ingameBgmIndex].play();
        }
    }

    createPlayer(playerInfo) {
        const PLAYER = this.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite).setDepth(10);
        this.players.add(PLAYER);

        PLAYER.instanceId = playerInfo.instanceId;
        PLAYER.dx = playerInfo.x;
        PLAYER.dy = playerInfo.y;
        PLAYER.name = playerInfo.name;
        PLAYER.score = playerInfo.score;
        PLAYER.hpMax = playerInfo.hpMax;
        PLAYER.hp = playerInfo.hp;
        PLAYER.isWeaponRapid = playerInfo.isWeaponRapid;

        // 플레이어 UI
        PLAYER.weapon = this.add.sprite(playerInfo.x, playerInfo.y + 6, playerInfo.weapon).setDepth(20);
        PLAYER.text = this.add
            .text(playerInfo.x, playerInfo.y - 42, playerInfo.name, {
                fontFamily: "NanumGothic",
                fontSize: "14px"
            })
            .setOrigin(0.5)
            .setDepth(40);
        PLAYER.hpBox = this.add.graphics().setDepth(40);
        PLAYER.hpBar = this.add.graphics().setDepth(40);
        PLAYER.hpBar.dx = 0;

        if (this.socket.id == playerInfo.instanceId) {
            this.cameras.main.startFollow(PLAYER, true);
            this.myPlayer = PLAYER;
        } else {
            this.createArrow(playerInfo.instanceId, 0xff0000);
        }
    }

    createBullet(bulletInfo) {
        const BULLET = this.add.sprite(bulletInfo.x, bulletInfo.y, bulletInfo.sprite).setDepth(30);
        this.bullets.add(BULLET);

        BULLET.instanceId = bulletInfo.instanceId;
        BULLET.dx = bulletInfo.x;
        BULLET.dy = bulletInfo.y;
        BULLET.flipX = bulletInfo.flipX;
    }

    createItem(itemInfo) {
        const ITEM = this.add.sprite(itemInfo.x, itemInfo.y, itemInfo.sprite);
        this.items.add(ITEM);

        ITEM.instanceId = itemInfo.instanceId;
        ITEM.dx = itemInfo.x;
        ITEM.dy = itemInfo.y;
        this.createArrow(ITEM.instanceId, 0x0000ff);
    }

    createArrow(targetId, color) {
        const ARROW = this.add
            .sprite(
                this.myPlayer != undefined ? this.myPlayer.x : 0,
                this.myPlayer != undefined ? this.myPlayer.y : 0,
                "arrow"
            )
            .setDepth(50);
        this.arrows.add(ARROW);

        ARROW.targetId = targetId;
        ARROW.setTint(color);
        ARROW.setAlpha(0.3);
    }

    createMap(currentMap) {
        this.map = this.make.tilemap({ key: currentMap });
        this.tileset = this.map.addTilesetImage("tileset");
        this.wallLayer = this.map.createStaticLayer("wall", this.tileset, 0, 0);
        this.platformLayer = this.map.createStaticLayer("platform", this.tileset, 0, 0);
        this.wallLayer.setDepth(Number.MIN_VALUE);
        this.platformLayer.setDepth(Number.MIN_VALUE);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
}
