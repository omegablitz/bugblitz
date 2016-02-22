/**
 * Created by Aashish on 2/21/2016.
 */
Template.game.helpers({
    board1White: function() {
        return numbro(Math.ceil(Template.instance().b1White.get()/1000.0)).format('00:00');
    },

    board1Black: function() {
        return numbro(Math.ceil(Template.instance().b1Black.get()/1000.0)).format('00:00');
    },

    board2White: function() {
        return numbro(Math.ceil(Template.instance().b2White.get()/1000.0)).format('00:00');
    },

    board2Black: function() {
        return numbro(Math.ceil(Template.instance().b2Black.get()/1000.0)).format('00:00');
    }
});