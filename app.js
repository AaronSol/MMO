let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);
let db = require('./db');

let gameState = require("./js/gameState");

app.use(express.static(__dirname + '/public'));

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/public/game.html");
});

////////////////////

io.on('connection', function (socket) {

    console.log("user connected");
    //Add current new user to gameState, isActive set to False, name = guest

    socket.on("playerName", name => {
        gameState.addPlayer(socket.id, name);
        let player = gameState.state.players[socket.id];
        socket.broadcast.emit('playerJoined', player);
        io.to(socket.id).emit('receiveSelf', player);


    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        socket.broadcast.emit("playerLeft", gameState.state.players[socket.id]);
        gameState.removePlayer(socket.id);
    });


    socket.on('updateIsActive', isActive => {
        gameState.updateIsActive(socket.id, isActive);
        socket.broadcast.emit('playerChangedActive', gameState.state.players[socket.id]);
    });

    socket.on('updateY', y => {
        gameState.updateY(socket.id, y);
        socket.broadcast.emit("playerMoved", gameState.state.players[socket.id]); //send updated player to all other players
    });


    socket.on('updateName', name => {
        gameState.updateName(socket.id, name);
    });

    //send gamestate players only to the user that requested them
    socket.on('getInitialPlayers', () => {
        io.to(socket.id).emit('receivePlayers', gameState.state.players);
    });

    socket.on('getHighScoreObject', () => {
        io.to(socket.id).emit('receiveHighScoreObject', gameState.state.highScoreObject)
    });

});

//game states and variables\\

let playerCheckInterval = null;
let pipeEmitInterval = null;
let checkForWinnerInterval = null;
let startTime = null;
let endTime = null;

let highScoreObject = null;

let countDownTime = 5.0;


function startPlayerCheckInterval() {
    gameState.state.activePlayers = 0;
    playerCheckInterval = setInterval(() => {
        let playerNum = gameState.getPlayerCount();

        if(playerNum <= 1) {
            io.emit('showWaitingForPlayers');
        } else {
            clearInterval(playerCheckInterval);
            io.emit('countDownStarted');

            countDownTime = 5.0;

            let countDownTimer = setInterval(() => {
                io.emit('countDownTime', countDownTime);
                countDownTime -= 1;
            }, 1000);

            setTimeout(() => {
                clearInterval(countDownTimer);
                if(gameState.getPlayerCount() > 1){
                    startGame();
                } else {
                    startPlayerCheckInterval();
                    io.emit('cancelGame');
                }
            }, 6000)
        }
    }, 10)
}

function startGame() {

    startTime = new Date();
    io.emit('startGame');
    gameState.state.activePlayers = gameState.getPlayerCount();
    startPipeEmitInterval();
    startCheckForWinnerInterval();


}

function startCheckForWinnerInterval() {
    checkForWinnerInterval = setInterval(() => {
        if(gameState.state.activePlayers <= 1) {
            let winnerid = gameState.findWinner();
            endGame(winnerid)
        }
    }, 10)
}


function startPipeEmitInterval() {
    pipeEmitInterval = setInterval(() => io.emit('createPipes', Math.floor(Math.random() * 5)), 3000);
}

function endGame(winnerid) {

    endTime = new Date();
    let totalGameTime = Math.floor((endTime - startTime) / 1000);//winner's score

    clearInterval(checkForWinnerInterval);
    clearInterval(pipeEmitInterval);

    let winner = gameState.state.players[winnerid];
    io.emit('endGame', {winner: winner, time: totalGameTime});

    if(winner !== undefined) {
        db.getHighScoreObject(highScoreObject => {
            if (totalGameTime > highScoreObject.score) {
                io.emit('receiveHighScoreObject', {name: winner.name, score: totalGameTime});
                db.updateHighScore(winner.name, totalGameTime);
                gameState.state.highScoreObject = {name: winner.name, score: totalGameTime};
            }
        });
    }

    setTimeout(() => {
        startPlayerCheckInterval()
    }, 5500)


}

//SERVER INITIALIZATION
db.getHighScoreObject(highScoreObject => {
    gameState.state.highScoreObject = highScoreObject;
    console.log(highScoreObject);

    server.listen(8081, function () {
        console.log(gameState);
        console.log(`Listening on ${server.address().port}`);
    });

    //Begin checking if enough players are in server to start
    startPlayerCheckInterval();
});

