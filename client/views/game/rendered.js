/**
 * Created by Aashish on 2/21/2016.
 */
Template.game.onRendered(function() {
    var removeGreySquares = function() {
        Template.instance().$('#board').find('.square-55d63').css('background', '');
    };

    var greySquare = function(square) {
        var squareEl = Template.instance().$('#board').find('.square-' + square);

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
                refresh(temp);
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
                refresh(temp);
                return 'snapback';
            }
            var newBPGN = temp.bpgn.get();
            newBPGN.push({move: move, boardNum: boardNum});
        }
    };
    var onSnapEnd = function(boardNum) {
        var tempDat = Template.currentData();
        var tempInstance = Template.instance();
        return function() {
            var bpgn = tempInstance.bpgn.get();
            for(let move of bpgn.slice().reverse())
                if(move.boardNum === boardNum) {
                    //bpgn = bpgn.pop();
                    //temp.bpgn.set(bpgn);
                    window.setTimeout(function(){Meteor.call('updateGame', tempDat.gameId, move)}, 3); // Let autohandler update
                    // try defer
                    //Meteor.call('updateGame', Template.currentData().gameId, move);
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

    var instance = Template.instance();
    doneResizing(instance);
    this.$('.board').css('max-width', (Math.min($(window).width() * 0.35, $(window).height() * 0.6) | 0) + "px");

    this.autorun(function() {
        layoutChanged.depend();
        doneResizing(Template.instance());
    });
    this.autorun(function() {
        windowChanged.depend();
        Template.instance().$('.board').css('max-width', (Math.min($(window).width() * 0.35, $(window).height() * 0.6) | 0) + "px");
    });
});

Template.game.onDestroyed(function() {
    var gameTemplates = Session.get("renderedGameTemplates");
    var thisIdx = _(gameTemplates).indexOf(this);
    gameTemplates.splice(thisIdx, 1);
    Session.set("renderedGameTemplates", gameTemplates);
    //Meteor.
});

doneResizing = function(tempInstance) {
    tempInstance.board1.get().resize();
    tempInstance.board2.get().resize();
    refresh(tempInstance);
};

refresh = function(tempInstance) {
    tempInstance.$('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b').find('[data-piece=wK], [data-piece=bK]').css('visibility','hidden');
    tempInstance.$('.piece-num').remove();
    var hideShow1 = buildHideShowStrings(tempInstance.game.get().boards[0].pieces.getPieces(), tempInstance.heldPieces.get()[0]);
    var hideShow2 = buildHideShowStrings(tempInstance.game.get().boards[1].pieces.getPieces(), tempInstance.heldPieces.get()[1]);
    var board1 = tempInstance.$('#board1');
    var board2 = tempInstance.$('#board2');
    var board1Spare = board1.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b');
    var board2Spare = board2.find('.spare-pieces-bottom-ae20f, .spare-pieces-top-4028b');
    board1Spare.find(hideShow1.hide).css('visibility','hidden');
    board2Spare.find(hideShow2.hide).css('visibility','hidden');
    var b1Show = board1Spare.find(hideShow1.show);
    showPieces(b1Show, tempInstance.game.get().boards[0].pieces.getPieces(), tempInstance.heldPieces.get()[0]);
    var b2Show = board2Spare.find(hideShow2.show);
    showPieces(b2Show, tempInstance.game.get().boards[1].pieces.getPieces(), tempInstance.heldPieces.get()[1]);

    var width = tempInstance.$('.piece-417db').width() * 2 + 2;
    var height = board1Spare.height();

    tempInstance.$('.clock').remove();

    board1.find('.spare-pieces-top-4028b').prepend("<div class='clock1top clock1 clock' style='position: absolute;'></div>");
    board1.find('.spare-pieces-bottom-ae20f').prepend("<div class='clock1bottom clock1 clock' style='position: absolute;'></div>");
    tempInstance.$('.clock1').css('margin-left', '-' + board1.find('.spare-pieces-top-4028b').css('padding-left'));

    board2.find('.spare-pieces-top-4028b').prepend("<div class='clock2top clock2 clock' style='position: absolute;'></div>");
    board2.find('.spare-pieces-bottom-ae20f').prepend("<div class='clock2bottom clock2 clock' style='position: absolute;'></div>");
    tempInstance.$('.clock2').css('margin-left', tempInstance.$('.piece-417db').width() * 5);

    tempInstance.$('.clock').css('width', width + "px");
    tempInstance.$('.clock').css('height', height + "px");
    tempInstance.$('.clock').css('font-size', Math.floor(height*0.6) + "px");
    tempInstance.$('.clock').css('background-color', 'rgba(0, 0, 0, 0.65');
    tempInstance.$('.clock').css('text-align', "center");
    tempInstance.$('.clock').css('vertical-align', "middle");
    tempInstance.$('.clock').css('line-height', height + "px");
    tempInstance.$('.clock').css('font-family', '"Lucida Console", Monaco, monospace');
    tempInstance.$('.clock').css('color', '#FAFAFA');

    Blaze.render(Blaze.View(function() {
        return numbro(Math.ceil(Template.instance().timers.get('b1W')/1000.0)).format('00:00').split(/:(.+)?/)[1];
    }), tempInstance.$('.clock1bottom')[0]);

    Blaze.render(Blaze.View(function() {
        return numbro(Math.ceil(Template.instance().timers.get('b1B')/1000.0)).format('00:00').split(/:(.+)?/)[1];
    }), tempInstance.$('.clock1top')[0]);

    Blaze.render(Blaze.View(function() {
        return numbro(Math.ceil(Template.instance().timers.get('b2B')/1000.0)).format('00:00').split(/:(.+)?/)[1];
    }), tempInstance.$('.clock2bottom')[0]);

    Blaze.render(Blaze.View(function() {
        return numbro(Math.ceil(Template.instance().timers.get('b2W')/1000.0)).format('00:00').split(/:(.+)?/)[1];
    }), tempInstance.$('.clock2top')[0]);
};

function buildHideShowStrings(pieces, heldPieces) {
    var hide = "";
    var show = "";
    _.each(_.keys(pieces), function(piece) {
        if(pieces[piece] - heldPieces[piece] === 0)
            hide += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
        else
            show += ', [data-piece=' + piece.charAt(0) + piece.charAt(1).toUpperCase() + ']';
    });
    return {show: show.substring(2), hide: hide.substring(2)};
}

function showPieces(show, boardPieces, boardHeldPieces) {
    show.css('visibility','visible');
    show.filter(function() {return $(this).parents('.spare-piece-container').length < 1;}).wrap('<span class="spare-piece-container"></div>');
    show.each(function(index, elem) {
        var num = boardPieces[$(elem).attr('data-piece').toLowerCase()] - boardHeldPieces[$(elem).attr('data-piece').toLowerCase()];
        if(num > 1) $('<div class="piece-num">' + num + '</div>').insertBefore(elem);
    });
}