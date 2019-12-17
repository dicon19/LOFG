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
    scene: [InitScene, MenuScene, CustomizeScene, CreditScene, IngameScene]
};

class Button extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite, callback) {
        super(scene, x, y, sprite);
        scene.add.existing(this);

        this.setInteractive();

        this.on("pointerover", () => {
            this.setTint(0xcccccc);
            scene.tweens.add({
                targets: this,
                scaleX: { value: 1.2 },
                scaleY: { value: 1.2 },
                ease: "Power4",
                duration: 300
            });
            sfxClickHover.play();
        });

        this.on("pointerout", () => {
            this.setTint(0xffffff);
            scene.tweens.add({
                targets: this,
                scaleX: { value: 1 },
                scaleY: { value: 1 },
                ease: "Power4",
                duration: 300
            });
        });

        this.on("pointerup", () => {
            callback();
            sfxClickOn.play();
        });
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function choose(a) {
    return a[Math.floor(Math.random() * a.length)];
}

const GAME = new Phaser.Game(CONFIG);
const SKINS = ["player1", "player2", "player3", "player4", "player5", "player6", "player7", "player8"];
let name = "";
let skin = choose(SKINS);

let ingameBgm = [];
let ingameBgmIndex = 0;
let bgmScheme,
    sfxAttack1,
    sfxClickHover,
    sfxClickOn,
    sfxCoin,
    sfxHeavyMachineGun,
    sfxNoAmmo,
    sfxPlayerDead,
    sfxPlayerJump,
    sfxTimeOver;
