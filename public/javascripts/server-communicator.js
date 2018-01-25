function connectUser() {
    var socket = io.connect('http://battleship.kerenwebhome.com');

    socket.on("loginResult", function (login) {
        loginFuncs.checkLogin(login);
    });

    socket.on("userlist", function(userlist) {
        loginFuncs.getUserList(userlist.userArr, userlist.self);
    });

    socket.on("userJoin", function (user) {
        loginFuncs.addUserToSelection(user);
    });

    socket.on("userLeave", function (leaver) {
        loginFuncs.removeUserFromSelection(leaver.username);
    });

    socket.on("isPlaying", function (usersPlaying) {
        loginFuncs.removeUserFromSelection(usersPlaying.user1);
        loginFuncs.removeUserFromSelection(usersPlaying.user2);
    });

    socket.on("game-request", function (requester) { 
        loginFuncs.approveRequest(requester);
    });

    socket.on("newGame", function (game) {
        loginFuncs.hideAll();
        gameMng.startGame(game);
    })

    socket.on("your-guess-result", function (lastTurn) {
        gameMng.applyResult(lastTurn, "opBoard");
    });

    socket.on("opponent-guess-result", function (lastTurn) {
        gameMng.applyResult(lastTurn, "myBoard");
    });

    socket.on("turn", function () {
        gameMng.setClickable();
    })

    socket.on("game-over", function (gameDetails) {
        gameMng.announceWinner(gameDetails.winner);
    })

    return socket;
}

// socket.emit functions
var socketOutput = function () {

    function sendLogin(username, socket) {
        socket.emit("login", {
            username: username,
            socketID: socket.id,
        });
    }

    function sendUserRequest(socketID, socket) {
        socket.emit("user-request", {
            socketID: socketID
        });
    }

    function gameAccepted(requesterSocket, socket) {
        socket.emit("gameAccepted", {
            requesterSocket: requesterSocket
        });
    }

    function sendGuess(gameIndex, guess, socket) {
        socket.emit("guess", {
            gameIndex: gameIndex,
            guess: guess
        });
    }

    function disconnect(socket) {
        socket.emit("disconnect");
    }

    function leaveGame(gameIndex, socket) {
        socket.emit("gameLeave", {index: gameIndex});
    }

    return {
        sendLogin: sendLogin,
        sendUserRequest: sendUserRequest,
        gameAccepted: gameAccepted,
        disconnect: disconnect,
        sendGuess: sendGuess,
        leaveGame: leaveGame
    }
}(socket);

var socket = connectUser(); // socket.on functions