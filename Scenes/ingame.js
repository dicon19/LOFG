/*
 * 인게임 씬
 */
var ingame = {
    create: function() {
        this.socket = io();
        this.players = this.add.group();

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                this.createPlayer(players[id]);
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            this.createPlayer(playerInfo);
        });

        this.socket.on('disconnect', (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        });

        this.world.setBounds(0, 0, 4480, 1080);

        this.wallpaper = this.add.sprite(0, 0, 'wallpaper');

        this.text = this.add.text(200, 500, '폰트 테스트');
        this.text.fixedToCamera = true;
        this.speed = 10;
    },

    update: function() {
        var hspd = cursors.right.isDown - cursors.left.isDown;
        var vspd = cursors.down.isDown - cursors.up.isDown;
        game.camera.x += hspd * this.speed;
        game.camera.y += vspd * this.speed;
        //game.camera.shake(0.05, 500);
    },

    createPlayer: function() {
        var player = this.add.sprite(Math.random() * 500, Math.random() * 500, 'ball');
    },
}