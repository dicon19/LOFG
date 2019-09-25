var config = {
    type: Phaser.AUTO,
    parent: 'phaser-wpnchall',
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/favicon.png');

    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
    this.load.image('tiles', 'assets/tilesets/tileset.png');
}

function create() {
    this.socket = io();
    this.players = this.add.group();

    this.socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === this.socket.id) {
                createPlayer(this, players[id], 'player');
            } else {
                createPlayer(this, players[id], 'player');
            }
        });
    });

    this.socket.on('newPlayer', (playerInfo) => {
        createPlayer(this, playerInfo, 'player');
    });

    this.socket.on('disconnect', (playerId) => {
        this.players.getChildren().forEach((player) => {
            if (playerId === player.playerId) {
                player.destroy();
            }
        });
    });

    this.socket.on('playerUpdates', (players) => {
        Object.keys(players).forEach((id) => {
            this.players.getChildren().forEach((player) => {
                if (players[id].playerId === player.playerId) {
                    player.setPosition(players[id].x, players[id].y);
                }
            });
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // 맵 불러오기
    var map = this.make.tilemap({key: 'map'});
    var tileset = map.addTilesetImage('tileset', 'tiles');
    var worldLayer = map.createStaticLayer('world', tileset, 0, 0);
}


function update() {
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;
    const up = this.cursors.up.isDown;

    if (left || right || up) {
        this.socket.emit('playerInput', {
            left: left,
            right: right,
            up: up
        });
    }
}

function createPlayer(self, playerInfo, sprite) {
    const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}