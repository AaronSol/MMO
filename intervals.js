let ic = require("interval-chain");

function startGameIntervals(gameState, io, db) {

    function getPreGameIntervals() {

        let playerCheckInterval = {
            callback: function () {
                let playerNum = gameState.getPlayerCount();

                if (playerNum <= 1) {
                    io.emit('showWaitingForPlayers');
                    return true;

                } else {
                    io.emit('countDownStarted');
                    gameState.state.countDownTime = 5.0;
                    return false;
                }
            },
            duration: 20
        };

        let countDownInterval = {
            callback: function () {
                if (gameState.state.countDownTime > 0) {
                    io.emit('countDownTime', gameState.state.countDownTime);
                    gameState.state.countDownTime -= 1;
                    return true;
                }
                return false;
            },
            duration: 1000

        };

        return ([playerCheckInterval, countDownInterval])

    }

    function getPipeEmitInterval() {
        return {
            callback: () => {
                if (gameState.state.gameIsActive) {
                    io.emit('createPipes', Math.floor(Math.random() * 5));
                    return true;
                }
                return false;
            },
            duration: 3000
        };
    }

    function getCheckForWinnerInterval() {
        return {
            callback: () => gameState.state.activePlayers > 1,
            duration: 10
        };
    }


    let preGameIntervals = getPreGameIntervals(gameState, io);

    let preGameIntervalLoop = new ic.LoopingIntervalChain(preGameToDuringGameTransition, ...preGameIntervals);

    let pipeEmitInterval = new ic.IntervalChain(null, getPipeEmitInterval(gameState, io));

    let checkForWinnerInterval = new ic.IntervalChain(endGame, getCheckForWinnerInterval(gameState));

    let startTime = null;
    let endTime = null;

    function preGameToDuringGameTransition() {

        if (gameState.getPlayerCount() > 1) { // if there are more than 1 players at end of countdown, start game
            preGameIntervalLoop.stopLoop();
            startTime = new Date();
            io.emit('startGame');
            gameState.state.gameIsActive = true;
            gameState.state.activePlayers = gameState.getPlayerCount();
            pipeEmitInterval.start();
            checkForWinnerInterval.start();

        } else { //else cancel the countdown and wait for players again
            io.emit('cancelGame');
        }
    }

    function endGame() {

        endTime = new Date();
        let totalGameTime = Math.floor((endTime - startTime) / 1000);//winner's score

        gameState.state.gameIsActive = false;

        let winnerID = gameState.findWinner();

        let winner = gameState.state.players[winnerID];
        io.emit('endGame', {winner: winner, time: totalGameTime});

        if (winner !== undefined) {
            db.getHighScoreObject(highScoreObject => {
                if (totalGameTime > highScoreObject.score) {
                    io.emit('receiveHighScoreObject', {name: winner.name, score: totalGameTime});
                    db.updateHighScore(winner.name, totalGameTime);
                    gameState.state.highScoreObject = {name: winner.name, score: totalGameTime};
                }
            });
        }

        setTimeout(() => {
            preGameIntervalLoop = new ic.LoopingIntervalChain(preGameToDuringGameTransition, ...preGameIntervals);
            preGameIntervalLoop.start()
        }, 5500)


    }

    preGameIntervalLoop.start();
}

module.exports.startGameIntervals = startGameIntervals;