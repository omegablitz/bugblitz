/**
 * Created by Aashish on 12/27/2015.
 */
Games = new Mongo.Collection("games");

Meteor.methods({
    newGame: function(id) {
        Games.insert({_id: id, timeControl: 5 * 60 * 1000, game: []});
    },

    gameExists: function(id) {
        return Games.find(id, {limit: 1}).count() !== 0
    },

    // TODO make client side method not check again
    updateGame: function(id, move) {
        // TODO Verify player has perms
        var game = Games.findOne({_id: id});
        var moveArr = game.game;

        var upd = {};
        var bugGame = new BugGame();
        bugGame.load(moveArr);
        var result = bugGame.move(move);
        if(result !== null && result !== false) {
            if(_.isUndefined(game.startTime)) {
                var startTime = Date.now();
                upd.$set = {startTime: startTime};
                move.time = game.timeControl;
            } else {
                var lastBoardMove = _.find(moveArr.slice().reverse(), function(b){return b.boardNum===move.boardNum});
                move.time = _.isUndefined(lastBoardMove) ? game.timeControl - Date.now() + game.startTime : 2 * game.timeControl - Date.now() + game.startTime - lastBoardMove.time;
            }
            upd.$push = {game: move};
            Games.update(id, upd);
        }
    }
});