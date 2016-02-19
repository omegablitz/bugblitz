// counter starts at 0
Session.setDefault('counter', 0);

Template.game.created = function() {
    this.heldPieces = new ReactiveVar([{'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}, {'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}]);
    this.bpgn = new ReactiveVar(Games.findOne({_id: FlowRouter.getParam("gameId")}).game);
    var game = new BugGame();
    game.load(this.bpgn.get());
    this.game = new ReactiveVar(game);
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
        if(Template.instance().board1 != undefined && Template.instance().board2 != undefined) {
            var b1 = Template.instance().board1.get();
            if(updGame.boards[0].fen() !== b1.fen())
                b1.position(updGame.boards[0].fen());
            var b2 = Template.instance().board2.get();
            if(updGame.boards[1].fen() !== b2.fen())
                b2.position(updGame.boards[1].fen());
            hidePieces(Template.instance());
        }
    });
};

Template.game.helpers({
    PGN: function() {
        return JSON.stringify(Template.instance().bpgn.get());
    },
    STATUS: function() {
        return Template.instance().game.get().boards[0].turn() + ", " + Template.instance().game.get().boards[1].turn();
    }
});

Template.game.onRendered(function() {
    var removeGreySquares = function() {
        $('#board').find('.square-55d63').css('background', '');
    };

    var greySquare = function(square) {
        var squareEl = $('#board').find('.square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var onMouseoutSquare = function(square, piece) {
        removeGreySquares();
    };

    var game = this.game.get();
    var onDragStart = function(boardNum) {
        var temp = Template.instance();
        return function(source, piece, position, orientation) {
            var game = temp.game.get().boards[boardNum].game;
            if (temp.game.get().gameOver() === true ||
                (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
            if(source === 'spare') {
                var old = temp.heldPieces.get()[boardNum];
                old[piece.toLowerCase()]++;
                //temp.heldPieces.set(old);
                hidePieces(temp);
            }
        }
    };
    var onDrop = function(boardNum) {
        var temp = Template.instance();
        return function(source, target, piece) {
            var bugGame = temp.game.get();
            var move;
            if(source!=='spare') {
                // TODO snapback if promotion, pop up dialogue
                move = bugGame.move({
                    from: source,
                    to: target,
                    promotion: 'q', // NOTE: always promote to a queen for example simplicity
                    boardNum: boardNum
                });
                if(move !== null) {
                    move = move.san;
                }
            } else {
                var old = temp.heldPieces.get()[boardNum];
                old[piece.toLowerCase()]--;

                move = piece.toLowerCase().charAt(1) + '@' + target;
                if(!bugGame.move({move: move, boardNum: boardNum})) move = false;
            }

            if (move === null || move === false){
                hidePieces(temp);
                return 'snapback';
            }
            var newBPGN = temp.bpgn.get();
            newBPGN.push({move: move, boardNum: boardNum});
        }
    };
    var onSnapEnd = function(boardNum) {
        var temp = Template.instance();
        return function() {
            var bpgn = temp.bpgn.get();
            for(let move of bpgn.reverse())
                if(move.boardNum === boardNum) {
                    //bpgn = bpgn.pop();
                    //temp.bpgn.set(bpgn);
                    window.setTimeout(function(){Meteor.call('updateGame', FlowRouter.getParam('gameId'), move)}, 3); // Let autohandler update
                    //Meteor.call('updateGame', FlowRouter.getParam('gameId'), move);
                    return;
                }
        }
    };

    var cfg = function(boardNum) {
        return {
            draggable: true,
            position: game.boards[boardNum].fen(),
            onDragStart: onDragStart(boardNum),
            onDrop: onDrop(boardNum),
            onSnapEnd: onSnapEnd(boardNum),
            //onMouseoverSquare: onMouseoverSquare,
            //onMouseoutSquare: onMouseoutSquare,
            sparePieces: true,
            pieceTheme: '/img/chesspieces/{piece}.png'
        };
    };
    var board1 = ChessBoard('board1', cfg(0));
    this.board1 = new ReactiveVar(board1);
    var board2 = ChessBoard('board2', cfg(1));
    board2.flip();
    this.board2 = new ReactiveVar(board2);
    hidePieces(Template.instance());

    var instance = Template.instance();
    var id;
    $(window).resize(function() {
        clearTimeout(id);
        id = setTimeout(doneResizing, 100);

    });

    function doneResizing(){
        board1.resize();
        board2.resize();
        hidePieces(instance);
    }
});

Template.game.onDestroyed(function() {
    $(window).off('resize');
});

function hidePieces(tempInstance) {
    $('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find('[data-piece=wK], [data-piece=bK]').css('visibility','hidden');
    var hide1 = "";
    var show1 = "";
    for(var piece in tempInstance.game.get().pieces[0]) {
        if(tempInstance.game.get().pieces[0].hasOwnProperty(piece) && tempInstance.game.get().pieces[0][piece] - tempInstance.heldPieces.get()[0][piece] === 0)
            hide1 += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
        else
            show1 += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
    }
    var hide2 = "";
    var show2 = "";
    for(piece in tempInstance.game.get().pieces[1]) {
        if(tempInstance.game.get().pieces[1].hasOwnProperty(piece) && tempInstance.game.get().pieces[1][piece] - tempInstance.heldPieces.get()[1][piece] === 0)
            hide2 += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
        else
            show2 += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
    }
    var board1 = $('#board1');
    var board2 = $('#board2');
    board1.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find(hide1.substring(2)).css('visibility','hidden');
    board2.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find(hide2.substring(2)).css('visibility','hidden');

    $('.piece-num').remove();

    var b1Pieces = board1.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find(show1.substring(2));
    b1Pieces.css('visibility','visible');
    b1Pieces.filter(function() {return $(this).parents('.spare-piece-container').length < 1;}).wrap('<span class="spare-piece-container"></div>');
    b1Pieces.each(function(index, elem) {
        var num = tempInstance.game.get().pieces[0][$(elem).attr('data-piece').toLowerCase()] - tempInstance.heldPieces.get()[0][$(elem).attr('data-piece').toLowerCase()];
        if(num > 1) $('<div class="piece-num">' + num + '</div>').insertBefore(elem);
    });

    var b2Pieces = board2.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find(show2.substring(2));
    b2Pieces.css('visibility','visible');
    b2Pieces.filter(function() {return $(this).parents('.spare-piece-container').length < 1;}).wrap('<span class="spare-piece-container"></div>');
    b2Pieces.each(function(index, elem) {
        var num = tempInstance.game.get().pieces[1][$(elem).attr('data-piece').toLowerCase()] - tempInstance.heldPieces.get()[1][$(elem).attr('data-piece').toLowerCase()];
        if(num > 1)  $('<div class="piece-num">' + num + '</div>').insertBefore(elem);
    });
}