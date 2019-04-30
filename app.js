let express = require('express');
let app = express();
let server = require('http').Server(app);
let gameState = require("./js/gameState");
let io = require('socket.io').listen(server);
let db = require('./db');
let startGameIntervals = require('./intervals').startGameIntervals;
let startSocketOnFunctions = require('./socketOnFunctions').startSocketOnFunctions;

app.use(express.static(__dirname + '/public'));

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/public/game.html");
});

//SERVER INITIALIZATION
db.getHighScoreObject(highScoreObject => {
    gameState.state.highScoreObject = highScoreObject;

    server.listen(8081, function () {
        console.log(`Listening on ${server.address().port}`);
    });

    //Begin socket message logic
    startSocketOnFunctions(gameState, io);

    //Begin game interval logic
    startGameIntervals(gameState, io, db);
});

