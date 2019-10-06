class CustomizeScene extends Phaser.Scene {
    constructor() {
        super({ key: "customizeScene" });
    }

    create() {
        this.cameras.main.setBackgroundColor("#81c147");

        this.leftArrow = this.add
            .sprite(320, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => console.log("LEFT")).flipX = true;

        this.rightArrow = this.add
            .sprite(960, 360, "arrow")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => console.log("RIGHT"));

        this.selectButton = this.add
            .sprite(640, 520, "button")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("menuScene"));

        this.player = this.add
            .sprite(640, 360, "player1")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(120, 120);
    }
}
