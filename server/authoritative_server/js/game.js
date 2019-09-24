const players = {};
const config = {
    autoFocus: false,
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    this.load.image('player', 'assets/player.png');
}

function create() {
    this.players = this.physics.add.group();

    io.on('connection', (socket) => {
        console.log('a user connected');

        // 플레이어 연결 끊김
        socket.on('disconnect', () => {
            console.log('user disconnected');
            removePlayer(this, socket.id);
            delete players[socket.id];
            io.emit('disconnect', socket.id);
        });

        // 플레이어 움직임
        socket.on('playerInput', (inputData) => {
            handlePlayerInput(this, socket.id, inputData);
        });

        // 새로운 플레이어 연길
        players[socket.id] = {
            x: Math.floor(Math.random() * 1280),
            y: Math.floor(Math.random() * 720),
            playerId: socket.id,
            input: {
                left: false,
                right: false,
                up: false,
                down: false
            }
        };
        addPlayer(this, players[socket.id]);
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });
}

function update() {
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;
        if (input.left) {
            player.x -= 10;
        } else if (input.right) {
            player.x += 10;
        } else if (input.up) {
            player.y -= 10;
        } else if (input.down) {
            player.y += 10;
        }
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
    });
    io.emit('playerUpdates', players);
}

function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
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

// Phaser 3.19.0 헤드리스 오류 수정
function WebGLTexture() {};

const game = new Phaser.Game(config);
window.gameLoaded();