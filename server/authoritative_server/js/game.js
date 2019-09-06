const players = {};
const config = {
    autoFocus: false,
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 0,
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

// Phaser 3.19.0 헤드리스 오류 해결
function WebGLTexture() {}

function preload() {
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('ship', 'assets/star_gold.png');
}

function create() {
    this.players = this.physics.add.group();

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('disconnect', () => {
            console.log('user disconnected');
            removePlayer(this, socket.id);
            delete players[socket.id];
            io.emit('disconnect', socket.id);
        });

        socket.on('playerInput', (inputData) => {
            handlePlayerInput(this, socket.id, inputData);
        });

        players[socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id,
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
            input: {
                left: false,
                right: false,
                up: false,
            }
        };
        addPlayer(this, players[socket.id]);
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', players[socket.id]);
        socket.emit('starLocation', {
            x: this.star.x,
            y: this.star.y,
        });
        socket.emit('updateScore', this.scores);
    });

    this.scores = {
        blue: 0,
        red: 0,
    };

    this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
    this.physics.add.collider(this.players);

    this.physics.add.overlap(this.players, this.star, (star, player) => {
        if (players[player.playerId].team === 'red') {
            this.scores.red += 10;
        } else {
            this.scores.blue += 10;
        }
        this.star.setPosition(randomPosition(700), randomPosition(500));
        io.emit('updateScore', this.scores);
        io.emit('starLocation', {
            x: this.star.x,
            y: this.star.y,
        });
    });
}

function update() {
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;
        if (input.left) {
            player.setAngularVelocity(-300);
        } else if (input.right) {
            player.setAngularVelocity(300);
        } else {
            player.setAngularVelocity(0);
        }

        if (input.up) {
            this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        } else {
            player.setAcceleration(0);
        }
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].rotation = player.rotation;
    });
    this.physics.world.wrap(this.players, 5);
    io.emit('playerUpdates', players);
}

function randomPosition(max) {
    return Math.floor(Math.random() * max) + 50;
}

function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);
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

const game = new Phaser.Game(config);
window.gameLoaded();