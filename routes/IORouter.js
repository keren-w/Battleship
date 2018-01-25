var express = require('express');
var router = express.Router();

//internal modules
var users = require('../users');
var gameMng = require('../game-manager')

module.exports = function (io) {

  //home page
  router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'Battleship'
    });
  });

  //socket.io Connection
  io.on("connection", function (socket) {
    console.log('A user connected with socket id: ' + socket.id);


    socket.on("login", function (id) {
      var loginResult = inspectLogin(id.socketID, id.username);
      var userList = users.getUserList();
      socket.emit("loginResult", {
        result: loginResult,
      });
      socket.emit("userlist", {
        self: id.username,
        userArr: userList
      });
      if (loginResult.success) {
        socket.broadcast.emit("userJoin", {
          username: id.username,
          socketID: id.socketID
        })
      }
    });


    socket.on("user-request", function (user) {
      var requester = users.getUser(socket.id);
      socket.to(user.socketID).emit("game-request", requester);
    });


    //setting a new game
    socket.on("gameAccepted", function (requester) {
      console.log("accepted game!");
      var requesterSocketID = requester.requesterSocket;
      var gameAccepter = users.getUser(socket.id);
      var gameRequester = users.getUser(requesterSocketID);
      //set user status to "playing"
      users.setStatusPlaying(socket.id);
      users.setStatusPlaying(requesterSocketID);
      //register players to game
      var gameIndex = gameMng.regGame(gameRequester, gameAccepter);
      //emit "isPlaying" to all
      io.emit("isPlaying", {
        user1: gameAccepter.username,
        user2: gameRequester.username
      });

      var oneBoard = gameMng.getBoard(gameIndex, 'accepter');
      //sending board to accepter
      socket.emit("newGame", {
        index: gameIndex,
        board: gameMng.getBoard(gameIndex, 'accepter')
      });
      //sending board to requester
      socket.to(requesterSocketID).emit("newGame", {
        index: gameIndex,
        board: gameMng.getBoard(gameIndex, 'requester')
      });
      //sending "turn"
      if (gameMng.getTurn(gameIndex).user.socketID === requesterSocketID) {
        socket.to(requesterSocketID).emit("turn");
      } else if (gameMng.getTurn(gameIndex).user.socketID === socket.id) {
        socket.emit("turn");
      }
    });


    //proccessing a guess
    socket.on("guess", function (turnDetails) {
      var gamePlayers = gameMng.getPlayers(turnDetails.gameIndex, socket.id);
      var guessResult = gameMng.resolveGuess(turnDetails.gameIndex, turnDetails.guess, gamePlayers.thisPlayer);
      var opSocketID = gamePlayers.opponent.user.socketID;
      //emitting guess results to both players
      //to guesser:
      socket.emit("your-guess-result", {
        coordinates: turnDetails,
        result: guessResult
      });
      //to guesser's opponent:
      socket.to(opSocketID).emit("opponent-guess-result", {
        coordinates: turnDetails,
        result: guessResult
      });
      //check for winner
      if (gameMng.checkWin(turnDetails.gameIndex)) {
        var winner = gameMng.getWinner(turnDetails.gameIndex);
        socket.emit("game-over", {
          winner: winner.user.username
        });
        socket.to(opSocketID).emit("game-over", {
          winner: winner.user.username
        });
        //unreg game
        gameMng.unRegGame(turnDetails.gameIndex);
      } else {
        //emitting "turn" to right player
        var turnPlayerID = gameMng.getTurn(turnDetails.gameIndex).user.socketID;
        if (turnPlayerID === opSocketID) {
          socket.to(opSocketID).emit("turn");
        } else {
          socket.emit("turn");
        }
      }
    });


    socket.on("gameLeave", function (gameDetails) {
      var userList = users.getUserList();
      //set user "isPlaying" to false
      users.setStatusAvailable(socket.id);
      //announce isAvailable
      io.emit("userJoin", {
        username: users.getUser(socket.id).username,
        socketID: socket.id
      });
      //send updated userlist
      var selfUsername = users.getUser(socket.id).username;
      socket.emit("userlist", {
        self: selfUsername,
        userArr: userList
      });
    });


    socket.on("disconnect", function () {
      var leaver = users.getUser(socket.id);
      users.removeUser(socket.id);
      // a person could leave the page before logging in. in this case leaver == 'undefined';
      if (leaver) {
        socket.broadcast.emit("userLeave", {
          username: leaver.username
        });
      }
    })


  });


  return router;
}

function inspectLogin(socketID, username) {
  var isLoggedIn = users.addUser(socketID, username);
  if (!isLoggedIn) {
    return {
      username: username,
      success: false
    }
  } else {
    return {
      username: username,
      success: true
    }
  }
}