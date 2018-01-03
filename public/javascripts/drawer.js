var drawer = function () {
    var elem = {
        gameCanvas: document.getElementById("game-canvas"),
        gameContainer: document.getElementById("game-container")
    }

    class CanvasDrawer {
        constructor() {
            this.canvas = elem.gameCanvas;
            if (!this.canvas.getContext) throw Error('No Canvas');
            this.ctx = this.canvas.getContext('2d');
            var iw = window.innerWidth - 30;
            var ih = 472;
            this.canvas.width = iw;
            this.canvas.height = ih;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    }

    class Board {
        constructor(boardside, startX, startY) {
            this.startX = startX;
            this.startY = startY;
            this.side = boardside;
            this.cells = [];
        }

        initBoard(ctx) { //static function?
            for (var i = 0; i < 10; ++i) {
                this.cells.push([]);
            }

            for (var i = 0; i < 10; ++i) {
                for (var j = 0; j < 10; ++j) {
                    var cellSide = this.side * 0.1;
                    var cellX = this.startX + (i * cellSide);
                    var cellY = this.startY + (j * cellSide);
                    this.cells[i].push(new Cell(cellX, cellY, cellSide, ctx));
                }
            }
        }

        drawBoard(ctx, boardName, newBoard) {
            this.initBoard(ctx);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.font = '24px Saira';
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillText(boardName + ':', this.startX, (this.startY - 15));
            ctx.strokeRect(this.startX, this.startY, this.side, this.side);
            for (var i = 0; i < 10; ++i) {
                for (var j = 0; j < 10; ++j) {
                    this.cells[i][j].drawCell();
                }
            }
            if (newBoard) {
                this.drawFleet(newBoard);
            }
        }

        drawFleet(newBoard) {
            for (var i = 0; i < newBoard.length; ++i) {
                var shipX = newBoard[i].startCor.x;
                var shipY = newBoard[i].startCor.y;
                for (var shipLen = 0; shipLen < newBoard[i].shiplength; ++shipLen) {
                    this.cells[shipX][shipY].drawShip();
                    if (newBoard[i].direction == 'x') {
                        ++shipX;
                    } else {
                        ++shipY;
                    }
                }
            }
        }
    }

    class Cell {
        constructor(x, y, cellSide, ctx) {
            this.x = x;
            this.y = y;
            this.cellSide = cellSide;
            this.ctx = ctx;
            this.isClicked = false;
        }
        drawCell() {
            this.ctx.strokeStyle = '#9ebced';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(this.x, this.y, this.cellSide, this.cellSide);
        }
        setHit(board) {
            if (board === "opBoard") { //also - if self name is "opBoard"
                this.ctx.fillStyle = 'rgba(249,87,47, 0.5)';
                this.ctx.fillRect(this.x, this.y, this.cellSide, this.cellSide);
            }
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(this.x + this.cellSide, this.y + this.cellSide);
            this.ctx.moveTo(this.x + this.cellSide, this.y);
            this.ctx.lineTo(this.x, this.y + this.cellSide);
            this.ctx.stroke();
        }
        setEmptyGuess() {
            this.ctx.fillStyle = 'rgba(70, 74, 81, 0.75)';
            this.ctx.fillRect(this.x, this.y, this.cellSide, this.cellSide);
        }

        drawShip() {
            this.ctx.fillStyle = 'rgb(249, 87, 47)';
            this.ctx.beginPath();
            this.ctx.arc(this.x + (this.cellSide / 2), this.y + (this.cellSide / 2), this.cellSide * 0.35, 0, Math.PI * 2, true);
            this.ctx.fill();
        }
    }

    function setCanvas(newBoard) {
        elem.gameContainer.style.display = "block";
        var gc = new CanvasDrawer();
        var canvasWidth = gc.width;
        var boardsSide = gc.height*0.75;
        var spaceBetween = boardsSide/2;
        var myBoard = new Board(boardsSide, ((canvasWidth/2) - (spaceBetween*2.5)), gc.height * 0.15, gc.ctx);
        var opBoard = new Board(boardsSide,  ((canvasWidth/2) + spaceBetween*0.5), gc.height * 0.15, gc.ctx);
        myBoard.drawBoard(gc.ctx, 'Your Board', newBoard);
        opBoard.drawBoard(gc.ctx, 'Opponent\'s Board');
        return {
            myBoard: myBoard,
            opBoard: opBoard
        }
    }

    return {
        setCanvas: setCanvas,
    }
}();