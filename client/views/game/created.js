/**
 * Created by Aashish on 2/21/2016.
 */
Template.game.created = function() {
    this.heldPieces = new ReactiveVar([{'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}, {'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}]);
    var gameObj = Games.findOne({_id: Template.currentData().gameId});
    this.bpgn = new ReactiveVar(gameObj.game);
    var game = new BugGame();
    game.load(this.bpgn.get());
    this.game = new ReactiveVar(game);
    this.timeControl = new ReactiveVar(gameObj.timeControl);
    this.startTime = new ReactiveVar(gameObj.startTime);
    initTimes(Template.instance());

    this.autorun(function() {
        var newGame = Games.findOne({_id: Template.currentData().gameId}).game;
        var updGame = new BugGame();
        updGame.load(newGame);
        setTimes(Template.instance(), newGame);
        Template.instance().game.set(updGame);
        Template.instance().bpgn.set(newGame);
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
    template.timers = new ReactiveDict();
    template.timers.set('b1W', tc);
    template.timers.set('b1B', tc);
    template.timers.set('b2W', tc);
    template.timers.set('b2B', tc);
    template.activeTimers = new ReactiveVar({});
    if(pgn.length > 0) {
        Meteor.call('getServerTime', function(err, sTime) {
            initBoardTime(template, 1, sTime);
            initBoardTime(template, 2, sTime);
        });
    }
}

function initBoardTime(template, boardNum, sTime) {
    var revPGN = template.bpgn.get().slice().reverse();
    var bMoves = _.chain(revPGN).filter(function(elem){return elem.boardNum === boardNum - 1}).pluck('time').value();
    var wTime = bMoves[1 - bMoves.length % 2];
    var bTime = bMoves[bMoves.length % 2];
    var toMove = template.game.get().boards[boardNum - 1].turn();
    var tc = template.timeControl.get();
    var st = template.startTime.get();
    var timeLeft = _.isUndefined(bMoves[0]) ? tc - sTime + st : 2 * tc - sTime + st - bMoves[0];
    if(toMove === 'w') {
        template.timers.set('b' + boardNum + 'B', _.isUndefined(bTime) ? tc : bTime);
        template.timers.set('b' + boardNum + 'W', timeLeft);
        startTimers(template, ['b' + boardNum + 'W'], [])
    } else {
        template.timers.set('b' + boardNum + 'W', wTime);
        template.timers.set('b' + boardNum + 'B', timeLeft);
        startTimers(template, ['b' + boardNum + 'B'], [])
    }
}

function setTimes(template, moves) {
    var reversePGN = moves.slice().reverse();
    if(reversePGN.length <= 0) {
        return;
    }
    var tc = template.timeControl.get();
    var timers = [];
    var reset = [];
    if(reversePGN[0].boardNum === 0 || reversePGN.length === 1) {
        var lastB1Times = _.chain(reversePGN).filter(function (b) {
            return b.boardNum === 0
        }).pluck('time').value();
        if (lastB1Times.length % 2 == 1) {
            // First move in arr is white
            template.timers.set('b1W',_.isUndefined(lastB1Times[0]) ? tc : lastB1Times[0]);
            template.timers.set('b1B',_.isUndefined(lastB1Times[1]) ? tc : lastB1Times[1]);
            timers.push('b1B');
            reset.push('b1W')
        } else {
            // First move in arr is black
            template.timers.set('b1B',_.isUndefined(lastB1Times[0]) ? tc : lastB1Times[0]);
            template.timers.set('b1W',_.isUndefined(lastB1Times[1]) ? tc : lastB1Times[1]);
            timers.push('b1W');
            reset.push('b1B')
        }
    }
    if(reversePGN[0].boardNum === 1 || reversePGN.length === 1) {
        var lastB2Times = _.chain(reversePGN).filter(function (b) {
            return b.boardNum === 1
        }).pluck('time').value();
        if (lastB2Times.length % 2 == 1) {
            // First move in arr is white
            template.timers.set('b2W',_.isUndefined(lastB2Times[0]) ? tc : lastB2Times[0]);
            template.timers.set('b2B',_.isUndefined(lastB2Times[1]) ? tc : lastB2Times[1]);
            timers.push('b2B');
            reset.push('b2W')
        } else {
            // First move in arr is black
            template.timers.set('b2B',_.isUndefined(lastB2Times[0]) ? tc : lastB2Times[0]);
            template.timers.set('b2W',_.isUndefined(lastB2Times[1]) ? tc : lastB2Times[1]);
            timers.push('b2W');
            reset.push('b2B')
        }
    }
    Tracker.nonreactive(function() {
        startTimers(template, timers, reset)
    })
}

function startTimers(template, timerArr, resetArr) {
    var activeTimers = template.activeTimers.get(); // string arr
    _.each(timerArr, function(timer) {
        if(_.has(activeTimers, timer))
            clearInterval(activeTimers[timer]);
        activeTimers[timer] = setInterval(function () {
            template.timers.set(timer, template.timers.get(timer) - 1000);
        }, 1000)
    });

    _.each(resetArr, function(timer) {
        if(_.has(activeTimers, timer)){
            clearInterval(activeTimers[timer]);
            delete activeTimers[timer];
        }
    });

    template.activeTimers.set(activeTimers);
}