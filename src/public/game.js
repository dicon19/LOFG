const CONFIG = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
    scene: [InitScene, MenuScene, CustomizeScene, IngameScene],
    pixelArt: true
};

const GAME = new Phaser.Game(CONFIG);
const SKINS = ["player1", "player2", "player3", "player4", "player5", "player6", "player7", "player8"];
let name = "";
let skin = choose(SKINS);
let bgm;

// 유틸리티
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
