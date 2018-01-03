var loggedIn = {};

class User {
    constructor(username, socketID) {
        this.username = username;
        this.socketID = socketID;
        this.isPlaying = false;
    }
}

function addUser(socketID, username) {
    var doesUserExist = checkLogin(username);
    if (!doesUserExist) {
        loggedIn[socketID] = new User(username, socketID);
        return true;
    } else {
        return false;
    }
}

function getUserList() {
    var userArr = [];
    for (key in loggedIn) {
        if (loggedIn[key]) {
            if (loggedIn[key].isPlaying === false) {
                userArr.push(loggedIn[key]);
            }
        }
    }
    return userArr;
}

function getUser(socketID) {
    return loggedIn[socketID];
}

function setStatusPlaying(socketID) {
    loggedIn[socketID].isPlaying = true;
}

function setStatusAvailable(socketID) {
    loggedIn[socketID].isPlaying = false;
}

function checkLogin(username) {
    for (key in loggedIn) {
        if (loggedIn[key]) {
            if (loggedIn[key].username == username) {
                return true;
            }
        }
    }
    return false;
}

function removeUser(socketID) {
    if (loggedIn[socketID]) {
        loggedIn[socketID] = null;
    }
}

module.exports = {
    addUser: addUser,
    getUserList: getUserList,
    getUser: getUser,
    setStatusPlaying: setStatusPlaying,
    setStatusAvailable: setStatusAvailable,
    removeUser: removeUser,
}