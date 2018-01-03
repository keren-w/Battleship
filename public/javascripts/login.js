var loginFuncs = function () {
    var isLoggedIn = false;
    var registeredUsername = "";
    var elem = {
        submitSelection: document.getElementById('submit-user-selection'),
        userSelection: document.getElementById('user-selection'),
        usersContainer: document.getElementById('users-container'),
        loginContainer: document.getElementById('login-container'),
        submitUsername: document.getElementById('submit-username'),
        acceptDiv: document.getElementById('accept-game'),
        loggedUser: document.getElementById('username'),
        requestingUser: document.getElementById('requester'),
        acceptButton: document.getElementById('accept'),
        waitDiv: document.getElementById('please-wait'),
        targetUser: document.getElementById('target-user')
    }

    function displayLoginWindow() {
        elem.usersContainer.style.display = 'none';
        elem.acceptDiv.style.display = 'none';
        elem.waitDiv.style.display = 'none';
        elem.loginContainer.style.display = 'block';
        window.addEventListener("beforeunload", function () {
            socketOutput.disconnect(socket);
        });
    }

    function displaySelectionWindow() {
        elem.waitDiv.style.display = 'none';
        elem.loginContainer.style.display = 'none';
        elem.usersContainer.style.display = 'block';
        submitUserSelection();
    }

    function validateUser(username) {
        if (username.length > 2 && username.length < 16 && username[0]) {
            return true;
        } else {
            return false;
        }
    }

    // Adds an event listener to the submit button
    function submitUser(socket) {
        elem.submitUsername.addEventListener("click", function () {
            if (isLoggedIn === false) {
                var username = document.getElementById('nick').value;
                if (validateUser(username)) {
                    socketOutput.sendLogin(username, socket);
                } else {
                    alert("User name needs to be a string within 8-16 characters\n Please try again.")
                }
            } else {
                alert('You are already logged in')
            }
        });
    }

    function checkLogin(login) {
        if (!login.result.success) {
            alert('This username already exists. Please choose another one.')
        } else {
            registeredUsername = login.result.username;
            elem.loggedUser.innerText = "Hello, " + registeredUsername;
            isLoggedIn = true;
        }
    }

    function getUserList(userArr, username) {
        displaySelectionWindow();
        elem.userSelection.innerHTML = "";
        for (i = 0; i < userArr.length; ++i) {
            if (userArr[i].username != username) {
                var newUser = document.createElement('option');
                newUser.innerText = userArr[i].username;
                newUser.dataset.socketID = userArr[i].socketID;
                elem.userSelection.appendChild(newUser);
            }
        }
    }

    function addUserToSelection(user) {
        if (user.username !== registeredUsername) {
            var onlineUser = document.createElement('option');
            onlineUser.innerText = user.username;
            onlineUser.dataset.socketID = user.socketID;
            elem.userSelection.appendChild(onlineUser);
        }
    }

    function removeUserFromSelection(leaver) {
        for (var i = 0; i < elem.userSelection.length; ++i) {
            if (elem.userSelection[i].innerText === leaver) {
                elem.userSelection[i].remove();
            }
        }
    }

    // Adds an event listener to the select option
    function submitUserSelection() {
        elem.submitSelection.addEventListener("click", function () {
            var selectedUser = elem.userSelection.selectedOptions;
            if (selectedUser.length > 1) {
                alert('You can only select one opponent.\n Please try again');
            } else {
                socketOutput.sendUserRequest(selectedUser[0].dataset.socketID, socket);
                elem.usersContainer.style.display = "none";
                elem.waitDiv.style.display = "block";
                elem.targetUser.innerText = selectedUser[0].innerText;
            }
        });
    }

    function approveRequest(requester) {
        elem.usersContainer.style.display = 'none';
        elem.acceptDiv.style.display = 'block';
        elem.requestingUser.innerText = requester.username;
        elem.acceptButton.addEventListener("click", function () {
            socketOutput.gameAccepted(requester.socketID, socket);
        });
    }

    function hideAll() {
        elem.loginContainer.style.display = 'none';
        elem.usersContainer.style.display = 'none';
        elem.acceptDiv.style.display = 'none';
        elem.waitDiv.style.display = 'none';
    }

    return {
        displayLoginWindow: displayLoginWindow,
        submitUser: submitUser,
        checkLogin: checkLogin,
        addUserToSelection: addUserToSelection,
        approveRequest: approveRequest,
        removeUserFromSelection: removeUserFromSelection,
        hideAll: hideAll,
        getUserList: getUserList,
    }
}();

window.onload = function () {
    loginFuncs.displayLoginWindow();
    loginFuncs.submitUser(socket);
}