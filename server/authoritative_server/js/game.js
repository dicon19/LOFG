const players = {};

const config = {
    autoFocus: false,
    type: Phaser.HEADLESS,
    parent: 'phaser-wpnchall',
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 500,
                debug: false
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Phaser 3.19.0 헤드리스 오류 수정
function WebGLTexture() {};

var game = new Phaser.Game(config);

function preload() {
	// 리소스 불러오기
    this.load.image('player', 'assets/sprites/player.png');
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
    this.load.image('tiles', 'assets/tilesets/tileset.png');
}

function create() {
    this.players = this.physics.add.group();

    io.on('connection', (socket) => {
        console.log('a user connected');

		// 새로운 플레이어 연길
        players[socket.id] = {
            x: Math.floor(Math.random() * 1280),
            y: 0,
            playerId: socket.id
        };
        addPlayer(this, players[socket.id]);
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', players[socket.id]);
		
        // 플레이어 연결 끊김	
        socket.on('disconnect', () => {
            console.log('user disconnected');
            removePlayer(this, socket.id);
            delete players[socket.id];
            io.emit('disconnect', socket.id);
        });

        // 플레이어 움직임
        socket.on('playerInput', (inputData) => {
            this.players.getChildren().forEach((player) => {
                if (socket.id === player.playerId) {
                    if (inputData.left) {
                        player.body.setVelocityX(-200);
                    }
                    if (inputData.right) {
                        player.body.setVelocityX(200);
                    }
                    if (inputData.up && player.body.onFloor()) {
                        player.body.setVelocityY(-500);
                    }
                }
            });
        });
    });

    // 맵 불러오기
    var map = this.make.tilemap({key: 'map'});
    var tileset = map.addTilesetImage('tileset', 'tiles');
    var worldLayer = map.createStaticLayer('world', tileset, 0, 0);
    worldLayer.setCollisionByExclusion(-1, true);
    this.physics.world.bounds.width = worldLayer.width;
    this.physics.world.bounds.height = worldLayer.height;

    this.physics.add.collider(this.players, worldLayer);
}

function update() {
    this.players.getChildren().forEach((player) => {
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
    });
    io.emit('playerUpdates', players);
}

function addPlayer(self, playerInfo) {
    const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}

window.gameLoaded();