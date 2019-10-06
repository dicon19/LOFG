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

        // (나를 포함한)서버에 있는 모든 플레이어 정보 받아오기
        this.socket.on("currentPlayers", (players) => {
            Object.keys(players).forEach((id) => {
                const playerInfo = players[id];

                if (playerInfo.playerId == this.socket.id) {
                    // 카메라 플레이어 고정
                    this.myPlayer;
                }
                this.addPlayer(playerInfo);
            });
        });

        // 새로운 플레이어 접속
        this.socket.on("newPlayer", (playerInfo) => {
            this.addPlayer(playerInfo);
        });

        // 플레이어 접속 끊김
        this.socket.on("disconnect", (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId == player.playerId) {
                    player.destroy();
                }
            });
        });

        // 게임 업데이트
        this.socket.on("playerUpdates", (players) => {
            Object.keys(players).forEach((id) => {
                this.players.getChildren().forEach((player) => {
                    const playerInfo = players[id];

                    if (playerInfo.playerId == player.playerId) {
                        // 플레이어 위치 설정
                        player.setPosition(playerInfo.x, playerInfo.y);

                        // 플레이어 애니메이션 설정
                        if (playerInfo.isMove) {
                            player.anims.play(playerInfo.sprite + "_walk", true);
                        } else {
                            player.anims.play(playerInfo.sprite + "_idle", true);
                        }

                        // 플레이어 좌우반전 설정
                        player.flipX = playerInfo.flipX;
                    }
                });
            });
        });

        // 핑 확인
        this.socket.on("latency", () => {
            let latency = Date.now() - startTime;
            this.pingText.setText(latency);
        });

        // 맵 불러오기
        this.map = this.make.tilemap({ key: "map" });
        this.tileset = this.map.addTilesetImage("tileset", "tiles");
        this.worldLayer = this.map.createStaticLayer("world", this.tileset, 0, 0);
        this.worldLayer.setDepth(-100);
    }

    update() {
        // 플레이어 이동 | 공격
        let left = this.cursors.left.isDown;
        let right = this.cursors.right.isDown;
        let up = this.cursors.up.isDown;
        let attack = this.cursors.space.isDown;

        if (left || right || up || attack) {
            this.socket.emit("playerInput", {
                left: left,
                right: right,
                up: up,
                attack: attack
            });
        }
    }

    addPlayer(playerInfo) {
        const player = this.add
            .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
            .setOrigin(0.5, 0.5);
        this.players.add(player);
        player.playerId = playerInfo.playerId;
    }
}
