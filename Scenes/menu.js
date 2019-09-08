/*
 * 메뉴 씬
 */
var menu = {
    create: function() {
        this.button = game.add.button(game.world.centerX, 400, 'ball', this.onUp);
        this.button.anchor.set(0.5);
    },

    onUp: function() {
        game.state.start('ingameScene');
    },
}