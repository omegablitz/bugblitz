BugGame = class BugGame {
    constructor() {
        this.refresh()
    }

    refresh() {
        this.boards = [new Board(), new Board()];
        this.history = [];
        this.promotedP = [];

        var color = ['w', 'b'];
        var pieces = ['p', 'r', 'n', 'b', 'q'];
        var cPiecesObj = _.chain(color).map(function(c) {
            return _.map(pieces, function(piece) {
                return c + piece;
            });
        }).flatten().reduce(function(piecesObj, cPiece) {
            piecesObj[cPiece] = 0;
            return piecesObj;
        }, {}).value();
        this.pieces = [cPiecesObj, _.clone(cPiecesObj)];
    }

    // [{move: 'e4', boardNum: 0}, {move: 'd4', boardNum: 1}, {move: 'e5', boardNum: 1}, {move: 'd5', boardNum: 0}, {move: 'exd5', boardNum: 0}, {move: 'h3', boardNum: 1}, {move: 'p@a4', boardNum: 1}]
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
            // TODO check if legal - checks
            var typeLoc = move.move.split('@');
            var toMove = board.turn();
            var success = board.put({type: typeLoc[0], color: toMove}, typeLoc[1]);
            if(success) this.pieces[boardNum][toMove + typeLoc[0]]--;
            return success;
        } else {
            var capture = move.hasOwnProperty('move')?board.move(move.move):board.move(move);
            if(capture !== null) {
                if (capture.hasOwnProperty('captured')) {
                    var captured = capture.captured;
                    var idx = _.indexOf(this.promotedP, capture.to);
                    if (idx !== -1) {
                        captured = 'p';
                        this.promotedP.splice(idx, 1);
                    }
                    this.pieces[(boardNum + 1) % 2][(capture.color === "w" ? "b" : "w") + captured]++;
                }
                if(capture.san.indexOf('=') !== -1)
                    this.promotedP.push(capture.to);
                var idx = _.indexOf(this.promotedP, capture.from);
                if(idx !== -1) {
                    this.promotedP[idx] = capture.to;
                }
            }
            return capture;
        }
    }

    gameOver() {
        // TODO account for dropping pieces
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
        this.times = [];
    }

    move(move, time) {
        var processedMove = this.game.move(move);
        if(processedMove === null) return null;
        this.times.push(time);
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

    put(piece, square) {
        if(this.game.get(square) !== null || piece.type === 'p' && (square.indexOf('8') !== -1 || square.indexOf('1') !== -1))
            return false;
        if(this.game.put(piece, square)) {
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
        return this.game.game_over();
    }
}