/**
 * Created by Aashish on 12/27/2015.
 */
Games = new Mongo.Collection("games");

Meteor.methods({
    newGame: function(id) {
        Games.insert({_id: id, startTime: (new Date).getMilliseconds(), game: []});
    },

    gameExists: function(id) {
        return Games.find(id, {limit: 1}).count() !== 0
    },

    // TODO make client side method not check again
    updateGame: function(id, move) {
        // TODO Verify player has perms
        var game = Games.findOne({_id: id});
        move.time = (new Date).getMilliseconds - game.startTime;
        var moveArr = game.game;
        var bugGame = new BugGame();
        bugGame.load(moveArr);
        var result = bugGame.move(move);
        if(result !== null && result !== false) {
            Games.update(id, {$push: {game: move}});
        } else {
        }
    }
});