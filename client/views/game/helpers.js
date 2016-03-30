/**
 * Created by Aashish on 2/21/2016.
 */
Template.game.helpers({
    board1Bottom: function() {
        return numbro(Math.ceil(Template.instance().timers.get('b1W')/1000.0)).format('00:00');
    },

    board1Top: function() {
        return numbro(Math.ceil(Template.instance().timers.get('b1B')/1000.0)).format('00:00');
    },

    board2Top: function() {
        return numbro(Math.ceil(Template.instance().timers.get('b2W')/1000.0)).format('00:00');
    },

    board2Bottom: function() {
        return numbro(Math.ceil(Template.instance().timers.get('b2B')/1000.0)).format('00:00');
    }
});