/*
 * 인게임 씬
 */
var ingame = {
    create: function () {
        // 변수 초기화
        this.players = [];

        // 월드 초기화
        game.world.setBounds(0, 0, gameWidth, gameHeight);
        game.wallpaper = game.add.sprite(0, 0, "wallpaper");

        // 소켓 설정
        socket.on("currentPlayers", (players) => {
            this.players.forEach((id) => {
                this.createPlayer(players[id]);
            });
        });

        socket.on("newPlayer", (playerInfo) => {
            this.createPlayer(playerInfo);
        });

        socket.on("disconnect", (playerId) => {
            players.forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        });
    },

    update: function () {

    },

    createPlayer: function () {
        var player = game.add.sprite(0, 0, "dummy_player");
        this.players.push(player);
    },
};