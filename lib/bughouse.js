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

    place(piece, square) {
        if(this.pieces.getPiece(piece.color + piece.type) <= 0)
            return false;
        if(this.game.get(square) !== null || piece.type === 'p' && (square.indexOf('8') !== -1 || square.indexOf('1') !== -1))
            return false;
        if(this.game.put(piece, square)) {
            if(this.game.in_check()) {
                this.game.remove(square);
                return false;
            }

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
        return false;
    }

    load(fen) {
        return this.game.load(fen);
    }

    gameOver() {
        // TODO Fix
        return this.game.game_over();
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
}