/*
 * 메뉴 씬
 */
var menu = {
    create: function() {
        game.world.setBounds(0, 0, 1920, 5400);
        this.button = game.add.button(game.world.centerX, 400, 'button', this.onUp).anchor.set(0.5);
    },

    onUp: function() {
        game.state.start('ingameScene');
    },
}