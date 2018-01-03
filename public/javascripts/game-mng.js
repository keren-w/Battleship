var gameMng = function () {
    var elem = {
        gameCanvas: document.getElementById("game-canvas"),
        yourTurn: document.getElementById("your-turn"),
        gameOver: document.getElementById("go-modal-container"),
        gameWinner: document.getElementById("winner"),
        finishGameButton: document.getElementById("finish-game")
    }
    var gameBoards = {};
    var gameIndex;

    function startGame(game) {
        gameIndex = game.index;
        gameBoards = drawer.setCanvas(game.board);
    };

    function setClickable() {
        elem.yourTurn.style.display = "block";
        elem.gameCanvas.addEventListener("click", getClick);
    };

    function getClick(e) {
        var opBoardX = gameBoards.opBoard.startX;
        var opBoardSide = gameBoards.opBoard.side;
        var opBoardY = gameBoards.opBoard.startY;
        var canvasTop = elem.gameCanvas.getBoundingClientRect().top;
        var relativeY = e.clientY - canvasTop;

        if (e.clientX > opBoardX && e.clientX < opBoardX + opBoardSide && relativeY > opBoardY && relativeY < opBoardY + opBoardSide) {
            getCell((e.clientX - opBoardX), (relativeY - opBoardY), opBoardSide);
        }
    }

    function getCell(x, y, side) {
        x /= side;
        y /= side;
        x = Math.floor(x * 10);
        y = Math.floor(y * 10);
        var wasCLicked = gameBoards.myBoard.cells[x][y].isClicked;
        if (wasCLicked === false) {
            socketOutput.sendGuess(gameIndex, {
                x: x,
                y: y,
            }, socket);
            elem.gameCanvas.removeEventListener("click", getClick);
            elem.yourTurn.style.display = "none";
            gameBoards.myBoard.cells[x][y].isClicked = true;
        }
    }

    function applyResult(lastTurn, board) {
        if (lastTurn.result === true) {
            gameBoards[board].cells[lastTurn.coordinates.guess.x][lastTurn.coordinates.guess.y].setHit(board);
        } else {
            gameBoards[board].cells[lastTurn.coordinates.guess.x][lastTurn.coordinates.guess.y].setEmptyGuess();
        }
    }

    function announceWinner(winner) {
        elem.gameOver.style.display = "block";
        elem.gameWinner.innerText = winner;
        elem.finishGameButton.addEventListener("click", verifyLeave);
    }

    function verifyLeave() {
        elem.finishGameButton.removeEventListener("click", verifyLeave);
        elem.yourTurn.style.display = "none";
        elem.gameOver.style.display = "none";
        elem.gameCanvas.style.display = "none";
        socketOutput.leaveGame(gameIndex, socket);
    }

    return {
        startGame: startGame,
        setClickable: setClickable,
        applyResult: applyResult,
        announceWinner: announceWinner,
    }
}();