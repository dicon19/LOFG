/*
 * 인게임 씬
 */
var ingame = {
    create: function () {
        // 변수 초기화
        this.players = {}

        // 월드 초기화
        this.world.setBounds(0, 0, gameWidth * 2 + gameWidth / 3 * 2, gameHeight);
        this.wallpaper = game.add.sprite(0, 0, "wallpaper");

        // UI
        this.text = game.add.text(200, 500, "폰트 테스트");
        this.text.fixedToCamera = true;

        // 소켓 설정
        socket.on("currentPlayers", (players) => {
            Object.keys(players).forEach((id) => {
                this.createPlayer(players[id]);
            });
        });

        socket.on("newPlayer", (playerInfo) => {
            this.createPlayer(playerInfo);
        });

        socket.on("disconnect", (playerId) => {
            Object.keys(this.players).forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        });
    },

    update: function () {
        var hspd = cursors.right.isDown - cursors.left.isDown;
        var vspd = cursors.down.isDown - cursors.up.isDown;
        this.camera.x += hspd * 10;
        this.camera.y += vspd * 10;
    },

    createPlayer: function () {
        var player = game.add.sprite(Math.random() * 500, Math.random() * 500, "ball");
    },
}