BugGame = class BugGame {
    constructor() {
        this.refresh()
    }

    refresh() {
        this.boards = [new Board(), new Board()];
        //var initPieces = {'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0};
        this.pieces = [{'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}, {'wp': 0, 'wr': 0, 'wn': 0, 'wb': 0, 'wq': 0, 'bp': 0, 'br': 0, 'bn': 0, 'bb': 0, 'bq': 0}];
        this.history = [];
        this.promotedP = [];
    }

    // [{move: 'e4', boardNum: 0}, {move: 'd4', boardNum: 1}, {move: 'e5', boardNum: 1}, {move: 'd5', boardNum: 0}, {move: 'exd5', boardNum: 0}, {move: 'h3', boardNum: 1}, {move: 'p@a4', boardNum: 1}]
    load(moveArr) {
        this.refresh();
        for(let m of moveArr) {
            var typeLoc = m.move.split('@');
            var toMove = this.boards[m.boardNum].turn();
            var boardNum = m.boardNum;
            if(m.move.indexOf('@') !== -1) {
                //p@a5
                this.boards[boardNum].put({type: typeLoc[0], color: toMove}, typeLoc[1]);
                this.pieces[boardNum][(toMove + typeLoc[0]).toLowerCase()]--;
            } else {
                var capture = this.boards[boardNum].move(m.move);
                if(capture.san.indexOf('=') !== -1)
                    this.promotedP.push(capture.to);
                if(capture.hasOwnProperty('captured')) {
                    this.pieces[(boardNum + 1) % 2][(capture.color === "w" ? "b" : "w") + capture.captured]++;
                }
            }
        }
        this.history = moveArr;
    }

    // TODO add to history
    move(move) {
        var boardNum = move.boardNum;
        if((typeof move.move === 'string' || move.move instanceof String) && move.move.indexOf('@') !== -1) {
            var typeLoc = move.move.split('@');
            var toMove = this.boards[boardNum].turn();
            if(this.pieces[boardNum][this.boards[boardNum].turn() + typeLoc[0].toLowerCase()] > 0 && this.boards[boardNum].game.get(typeLoc[1]) == null && !(typeLoc[0] == 'p' && (typeLoc[1].indexOf('8') !== -1 || typeLoc[1].indexOf('1') !== -1))) {
                var success = this.boards[boardNum].put({type: typeLoc[0], color: toMove}, typeLoc[1]);
                if(success) this.pieces[boardNum][(this.boards[boardNum].turn() === "w" ? "b" : "w") + typeLoc[0].toLowerCase()]--;
                return success;
            }
            return null;
        } else {
            var capture = move.hasOwnProperty('move')?this.boards[boardNum].move(move.move):this.boards[boardNum].move(move);
            if(capture !== null && capture.hasOwnProperty('captured')) {
                this.pieces[(boardNum + 1) % 2][(capture.color === "w" ? "b" : "w") + capture.captured]++;
            } else {
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

    pgn() {
        return this.game.pgn();
    }

    ascii() {
        return this.game.ascii();
    }

    turn() {
        return this.game.turn();
    }

    put(piece, square) {
        if(this.game.put(piece, square)) {
            var fen = this.fen();
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