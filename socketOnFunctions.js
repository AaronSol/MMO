function startSocketOnFunctions(gameState, io) {
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
}

module.exports.startSocketOnFunctions = startSocketOnFunctions;