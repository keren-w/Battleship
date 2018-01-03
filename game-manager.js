var gamesOn = [];
var releasedIndexes = [];
var hitCount = 20;

class Game {
    constructor(requester, accepter, index) {
        this.requester = new Player(requester, index);
        this.accepter = new Player(accepter, index);
        this.turn = 0;
        this.winner = 0;
    }
    initGame(board1, board2) {
        this.requester.initBoard(board1);
        this.accepter.initBoard(board2);
        this.requester.opponent = this.accepter;
        this.accepter.opponent = this.requester;
    }
}

class Player {
    constructor(user, index) {
        this.gameID = index;
        this.user = user;
        this.opponent = null;
        this.hitCount = hitCount;
        this.board = [];
    }
    initBoard(board) {
        this.board = board;
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Battleship {
    constructor(startCor, shiplength, direction) {
        this.startCor = startCor;
        this.shiplength = shiplength;
        this.direction = direction;
    }
}

function regGame(requester, accepter) {
    var gameIndex;
    if (!releasedIndexes.length) {
        gameIndex = gamesOn.length;
        gamesOn.push(new Game(requester, accepter, gameIndex));
    } else {
        lastFreeIndex = releasedIndexes.length - 1;
        gameIndex = releasedIndexes[lastFreeIndex];
        gamesOn[gameIndex] = new Game(requester, accepter, gameIndex);
        releasedIndexes.pop();
    }
    var board1 = generateBoard(10);
    var board2 = generateBoard(10);
    gamesOn[gameIndex].initGame(board1, board2);
    if (randomizeTurn === 0) {
        gamesOn[gameIndex].turn = gamesOn[gameIndex].requester;
    } else {
        gamesOn[gameIndex].turn = gamesOn[gameIndex].accepter;
    }
    return gameIndex;
}

function getBoard(gameIndex, player) {
    return gamesOn[gameIndex][player].board;
}

function getTurn(gameIndex) {
    return gamesOn[gameIndex].turn;
}

function randomizeTurn() {
    return Math.round(Math.random());
}

function resolveGuess(gameIndex, guess, thisPlayer) {
    var thisOpBoard = thisPlayer.opponent.board;
    for (var shipIndex = 0; shipIndex < thisOpBoard.length; ++shipIndex) {
        var thisShipX = thisOpBoard[shipIndex].startCor.x;
        var thisShipY = thisOpBoard[shipIndex].startCor.y;
        var thisShipLength = thisOpBoard[shipIndex].shiplength;
        for (var i = 0; i < thisShipLength; ++i) {
            if (thisShipX === guess.x && thisShipY === guess.y) {
                --thisPlayer.hitCount;
                gamesOn[gameIndex].turn = thisPlayer;
                return true; // hit
            }
            if (thisOpBoard[shipIndex].direction === 'x') {
                ++thisShipX;
            } else if (thisOpBoard[shipIndex].direction === 'y') {
                ++thisShipY;
            }
        }
    }
    gamesOn[gameIndex].turn = thisPlayer.opponent;
    return false;
}

function getPlayers(gameIndex, socketID) {
    if (socketID) {
        if (gamesOn[gameIndex].requester.user.socketID === socketID) {
            return {
                thisPlayer: gamesOn[gameIndex].requester,
                opponent: gamesOn[gameIndex].accepter,
            }
        } else if (gamesOn[gameIndex].accepter.user.socketID === socketID) {
            return {
                thisPlayer: gamesOn[gameIndex].accepter,
                opponent: gamesOn[gameIndex].requester,
            }
        }
    } else {
        return {
            requester: gamesOn[gameIndex].requester,
            accepter: gamesOn[gameIndex].accepter
        }
    }
}

function checkWin(gameIndex) {
    if (gamesOn[gameIndex].requester.hitCount === 0 || gamesOn[gameIndex].accepter.hitCount === 0) {
        if (gamesOn[gameIndex].requester.hitCount === 0) {
            gamesOn[gameIndex].winner = gamesOn[gameIndex].requester;
        } else {
            gamesOn[gameIndex].winner = gamesOn[gameIndex].accepter;
        }
        return true;
    }
    return false;
}

function getWinner(gameIndex) {
    return gamesOn[gameIndex].winner;
}

function unRegGame(gameIndex) {
    gamesOn[gameIndex] = null;
    releasedIndexes.push(gameIndex);
}

module.exports = {
    regGame: regGame,
    getBoard: getBoard,
    getTurn: getTurn,
    resolveGuess: resolveGuess,
    getPlayers: getPlayers,
    checkWin: checkWin,
    getWinner: getWinner,
    unRegGame: unRegGame
}


// var board1 = [new Battleship(new Coordinate(3, 5), 5, 'x'), new Battleship(new Coordinate(1, 2), 4, 'y')];
// var board2 = [new Battleship(new Coordinate(2, 3), 5, 'x'), new Battleship(new Coordinate(9, 4), 4, 'y')];

function generateBoard(cells) {
    var i, j;
    var tempBoard = [];
    var shipArr = [];
    var boardSettings = [{
            shipLength: 4,
            qty: 1
        },
        {
            shipLength: 3,
            qty: 2
        }, {
            shipLength: 2,
            qty: 3
        }, {
            shipLength: 1,
            qty: 4
        }
    ]

    //initializing an empty 2d array
    for (i = 0; i < cells; ++i) {
        tempBoard.push([]);
        for (j = 0; j < cells; ++j) {
            tempBoard[i].push("");
        }
    }
    for (i = 0; i < boardSettings.length; ++i) {
        // for each shipType
        for (j = 0; j < boardSettings[i].qty; ++j) {
            //for each ship
            var newShip = placeShip(boardSettings[i].shipLength, tempBoard, cells);
            shipArr.push(newShip);
        }
    }
    return shipArr;
}


function placeShip(shipLength, board, cells) {
    var direction = randomDirection();

    if (direction === 'x') {

        do {
            var i = 0;
            var rX = randomCell(0, (cells - shipLength - 1));
            var rY = randomCell(0, (cells - 1));

            if (!board[newX = rX][rY]) { // if cell is empty
                do {
                    ++newX;
                    ++i;
                } while ((!board[newX][rY]) && (i < shipLength));
            }

            if (i === shipLength) {
                break;
            }

        } while (board[newX][rY]);

        ApplyOnBoard(board, 'x', shipLength, rX, rY);
        var appliedShip = new Battleship(new Coordinate(rX, rY), shipLength, direction);
        return appliedShip;
    }

    if (direction === 'y') {

        do {
            var i = 0;
            var rX = randomCell(0, (cells - 1));
            var rY = randomCell(0, (cells - shipLength - 1));

            if (!board[rX][newY = rY]) { // if cell is empty
                do {
                    ++newY;
                    ++i;
                } while ((!board[rX][newY]) && (i < shipLength));
            }

            if (i === shipLength) {
                break;
            }

        } while (board[rX][newY]);
        ApplyOnBoard(board, 'y', shipLength, rX, rY);
        var appliedShip = new Battleship(new Coordinate(rX, rY), shipLength, direction);
        return appliedShip;
    }
}

function ApplyOnBoard(board, direction, shipLength, x, y) {
    if (direction === 'x') {
        if ((x - 1) >= 0) {
            board[x - 1][y] = '-t';
            if ((y - 1) >= 0) {
                board[x - 1][y - 1] = '-tl';
            }
            if ((y + 1) < 10) {
                board[x - 1][y + 1] = '-tr';
            }
        }
        for (var i = 0; i < shipLength; ++i) {
            board[x][y] = 'X';
            if ((y + 1) < 10) {

                board[x][y + 1] = '-r';
            }
            if ((y - 1) >= 0) {
                board[x][y - 1] = '-l';
            }
            ++x;
        }
        if (x < 10) {
            board[x][y] = '-b';

            if ((y - 1) >= 0) {
                board[x][y - 1] = '-bl';
            }

            if ((y + 1) < 10) {
                board[x][y + 1] = '-br';
            }
        }
    }

    if (direction === 'y') {
        if ((y - 1) >= 0) {
            board[x][y - 1] = '-t';

            if ((x - 1) >= 0) {
                board[x - 1][y - 1] = '-tl';
            }

            if ((x + 1) < 10) {
                board[x + 1][y - 1] = '-tr';
            }
        }
        for (var i = 0; i < shipLength; ++i) {
            board[x][y] = 'X';
            if ((x + 1) < 10) {
                board[x + 1][y] = '-r';
            }
            if ((x - 1) >= 0) {
                board[x - 1][y] = '-l';
            }
            ++y;
        }
        if (y < 10) {
            board[x][y] = '-b';

            if ((x - 1) >= 0) {
                board[x - 1][y] = '-br';
            }

            if ((x + 1) < 10) {
                board[x + 1][y] = '-bl';
            }
        }
    }
}

function randomDirection() {
    var oneOfTwo = Math.round(Math.random());
    if (oneOfTwo === 1) {
        return 'x';
    } else {
        return 'y'
    }
}

function randomCell(from, to) {
    var randomResult = Math.round(Math.random() * (to - from));
    return randomResult;
}