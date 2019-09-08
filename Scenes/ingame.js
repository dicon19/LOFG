/*
 * 인게임 씬
 */
var ingame = {
    create: function() {
        this.world.setBounds(0, 0, 4480, 1080);
        this.wallpaper = game.add.sprite(0, 0, 'wallpaper');

        this.text = game.add.text(200, 500, '폰트 테스트');
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
}