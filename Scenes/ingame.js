/*
 * 인게임 씬
 */
var ingame = {
    create: function() {
        this.world.setBounds(0, 0, gameWidth * 2 + gameWidth / 3 * 2, gameHeight);
        this.players = this.add.group();
        
        socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                this.createPlayer(players[id]);
            });
        });
        
        socket.on('newPlayer', (playerInfo) => {
            this.createPlayer(playerInfo);
        });
        
        socket.on('disconnect', (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        });

        this.wallpaper = this.add.sprite(0, 0, 'wallpaper');

        this.text = this.add.text(200, 500, '폰트 테스트');
        this.text.fixedToCamera = true;
        this.speed = 10;
    },

    update: function() {
        var hspd = cursors.right.isDown - cursors.left.isDown;
        var vspd = cursors.down.isDown - cursors.up.isDown;
        this.camera.x += hspd * this.speed;
        this.camera.y += vspd * this.speed;
    },

    createPlayer: function() {
        var player = this.add.sprite(Math.random() * 500, Math.random() * 500, 'ball');
    },
}