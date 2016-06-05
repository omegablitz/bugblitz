BugGame = class BugGame {
    constructor() {
        this.refresh();
    }

    refresh() {
        this.boards = [new Board(), new Board()];
        this.history = [];
    }

    load(moveArr) {
        this.refresh();
        for(let m of moveArr) {
            this.move(m);
        }
    }

    // TODO add to history
    move(move) {
        var boardNum = move.boardNum;
        var board = this.boards[boardNum];
        if((typeof move.move === 'string' || move.move instanceof String) && move.move.indexOf('@') !== -1) {
            var typeLoc = move.move.split('@');
            return board.place({type: typeLoc[0], color: board.turn()}, typeLoc[1]);
        } else {
            var capture = _.has(move, 'move') ? board.move(move.move) : board.move(move);
            if (capture !== null && _.has(capture, 'captured')) {
                this.boards[(boardNum + 1) % 2].pieces.addPiece(board.turn() + capture.captured);
            }
            return capture;
        }
    }

    gameOver() {
        return this.boards[0].gameOver() || this.boards[1].gameOver();
    }

    ascii() {
        return this.boards[0].ascii() + "\n" + this.boards[1].ascii();
    }

    hash() {
        return this.boards[0].fen() + this.boards[1].fen();
    }
};

class Board {
    constructor() {
        this.game = new Chess();
        this.pieces = new CapturedPieces();
        this.promotedP = [];
        this.squares = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
            "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
            "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
            "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
            "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
            "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
            "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
            "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
    }

    move(move) {
        var processedMove = this.game.move(move);
        if(processedMove !== null) {
            if (_.has(processedMove, 'captured')) {
                var idx = _.indexOf(this.promotedP, processedMove.to);
                if (idx !== -1) {
                    processedMove.captured = 'p';
                    this.promotedP.splice(idx, 1);
                }
            }
            if(processedMove.flags.indexOf('p') !== -1)
                this.promotedP.push(processedMove.to);
            var i = _.indexOf(this.promotedP, processedMove.from);
            if(i !== -1) {
                this.promotedP[i] = processedMove.to;
            }
        }
        return processedMove;
    }
    fen() {
        return this.game.fen();
    }

    ascii() {
        return this.game.ascii();
    }

    turn() {
        return this.game.turn();
    }

    canPlace(piece, square) {
        if(this.pieces.getPiece(piece.color + piece.type) <= 0)
            return false;
        if(this.game.get(square) !== null || piece.type === 'p' && (square.indexOf('8') !== -1 || square.indexOf('1') !== -1))
            return false;
        if(this.game.put(piece, square)) {
            var check = this.game.in_check();
            this.game.remove(square);
            return !check;
        }
        return false;
    }

    place(piece, square) {
        if(!this.canPlace(piece, square)) return false;
        this.game.put(piece, square);
        this.pieces.remPiece(piece.color + piece.type);

        var fen = this.fen();
        var split = fen.split(' ');
        split[3] = '-';
        fen = split.join(' ');
        if (fen.indexOf(' w ') !== -1)
            this.load(fen.replace(' w ', ' b '));
        else
            this.load(fen.replace(' b ', ' w '));
        return true;
    }

    load(fen) {
        return this.game.load(fen);
    }

    gameOver() {
        if(!this.game.game_over()) return false;
        // Can place pawn or piece on 2-7 rank
        var color = this.turn();
        // Could block with piece
        return !_.chain(this.squares).map(function (square) {
            return this.canPlace({type: 'b', color: color}, square)
        }, this).contains(true).value();


    }
}

class CapturedPieces {
    constructor() {
        this.pieces = _.chain(['w', 'b']).map(function(c) {
            return _.map(['p', 'r', 'n', 'b', 'q'], function(piece) {
                return c + piece;
            });
        }).flatten().reduce(function(piecesObj, cPiece) {
            piecesObj[cPiece] = 0;
            return piecesObj;
        }, {}).value();
    }

    getPieces() {
        return this.pieces;
    }

    getPiece(piece) {
        if(_.has(this.pieces, piece)) {
            return piece;
        }
    }

    addPiece(piece) {
        if(_.has(this.pieces, piece))
            this.pieces[piece]++;
        else
            console.log('invalid piece');
    }

    remPiece(piece) {
        if(_.has(this.pieces, piece))
            this.pieces[piece]--;
        else
            console.log('invalid piece');
    }

    colorPieces(color) {
        return _.omit(this.pieces, function(val, key){return key.charAt(0) !== color})
    }

    hasPiece(color) {
        return _.chain(this.colorPieces(color)).values().reduce(function(hasPiece, elem){return hasPiece || elem  > 0}, false).value()
    }

    hasNotPawn(color) {
        return _.chain(this.colorPieces(color)).omit(function(val, key){return key.charAt(1) === 'p'}).values().reduce(function(hasPiece, elem){return hasPiece || elem  > 0}, false).value()
    }
}