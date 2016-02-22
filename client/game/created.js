/**
 * Created by Aashish on 2/21/2016.
 */
Template.game.created = function() {
    this.heldPieces = new ReactiveVar([{'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}, {'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}]);
    var gameObj = Games.findOne({_id: FlowRouter.getParam("gameId")});
    this.bpgn = new ReactiveVar(gameObj.game);
    var game = new BugGame();
    game.load(this.bpgn.get());
    this.game = new ReactiveVar(game);
    this.timeControl = new ReactiveVar(gameObj.timeControl);
    this.startTime = new ReactiveVar(gameObj.startTime);
    initTimes(Template.instance());

    this.autorun(function() {
        var bPGN = Template.instance().bpgn.get();
        var newGame = Games.findOne({_id: FlowRouter.getParam("gameId")}).game;
        if(newGame.toString() !== bPGN.toString()) {
            var game = Template.instance().game.get();
            game.load(newGame);
            Template.instance().game.set(game);
            Template.instance().bpgn.set(newGame);
        }
        var updGame = Template.instance().game.get();
        var reverse = newGame.slice().reverse();
        var lastMove1 = _.find(reverse, function(b){return b.boardNum===0});
        var lastMove2 = _.find(reverse, function(b){return b.boardNum===1});
        if(Template.instance().board1 != undefined && Template.instance().board2 != undefined) {
            var b1 = Template.instance().board1.get();
            if(updGame.boards[0].fen() !== b1.fen())
                b1.position(updGame.boards[0].fen(), !_.isUndefined(lastMove1) && lastMove1.move.indexOf('=') === -1);
            var b2 = Template.instance().board2.get();
            if(updGame.boards[1].fen() !== b2.fen())
                b2.position(updGame.boards[1].fen(), !_.isUndefined(lastMove2) && lastMove2.move.indexOf('=') === -1);
            refresh(Template.instance());
        }
    });
};

function initTimes(template) {
    var tc = template.timeControl.get();
    var game = template.game.get();
    var st = template.startTime.get();
    var pgn = template.bpgn.get();
    template.b1White = new ReactiveVar(tc);
    template.b1Black = new ReactiveVar(tc);
    template.b2White = new ReactiveVar(tc);
    template.b2Black = new ReactiveVar(tc);
    if(pgn.length > 0) {
        Meteor.call('getServerTime', function(err, sTime) {
            var lastB1Move = _.find(pgn.slice().reverse(), function(b){return b.boardNum===0});
            var timeLeftB1 = _.isUndefined(lastB1Move) ? tc - sTime + st : 2 * tc - sTime + st - lastB1Move.time;
            if(game.boards[0].turn() === 'w') {
                template.b1Black.set(timeLeftB1);
                template.b1White.set(lastB1Move.time);
            } else {
                template.b1White.set(timeLeftB1);
                template.b1Black.set(lastB1Move.time);
            }
            var lastB2Move = _.find(pgn.slice().reverse(), function(b){return b.boardNum===1});
            var timeLeftB2 = _.isUndefined(lastB2Move) ? tc - sTime + st : 2 * tc - sTime + st - lastB2Move.time;
            if(game.boards[1].turn() === 'w') {
                template.b2Black.set(timeLeftB2);
                template.b2White.set(lastB2Move.time);
            } else {
                template.b2White.set(timeLeftB2);
                template.b2Black.set(lastB2Move.time);
            }
        });
    }
}