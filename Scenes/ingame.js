/*
 * 인게임 씬
 */
var ingame = {
    create: function() {
        game.world.resize(1920, 1080);
        this.wallpaper = game.add.sprite(0, 0, 'wallpaper');
        this.text = game.add.text(200, 500, '');
    },

    update: function() {
        if (cursors.up.isDown) {
            
        }

        if (cursors.down.isDown) {
            
        }
    
        if (cursors.left.isDown) {
            
        }

        if (cursors.right.isDown) {
            
        }
    },
}