let gameState = {
    state: { //shared with and changed by clients/server
        players: {}, //key = socket id of player, value = {name: "guest", isActive: false, y:300, id: id}
        countDownIsActive: false,
        gameIsActive: false,
        countDownTime: 5.0,
        activePlayers: 0,
        highScoreObject: {name: "example", score: -1}
        //TODO: power-ups??
    },
    //server only info/methods to change the state var ^^

    addPlayer: function(id, name="guest-" + id.substring(0, 6)) {
        this.state.players[id] = {name: name, isActive: false, y:300, id: id};
    },

    removePlayer: function(id) {
        let player = this.state.players[id];
        if(player) {
            delete this.state.players[id];
            if (player.isActive) {
                this.state.activePlayers -= 1;
            }
        }
    },

    updateY: function(id ,y) {
        let player = this.state.players[id];
        player.y = y;
    },

    updateName: function(id, name) {
        let player = this.state.players[id];
        player.name = name;
    },

    updateIsActive: function(id, isActive) {
        let player = this.state.players[id];
        player.isActive = isActive;
        if(!isActive){
            this.state.activePlayers -= 1;
        }
    },

    getPlayerCount: function() { //returns number of players
        return Object.keys(this.state.players).length;
    },

    getActivePlayerCount: function() { //returns number of players
        return Object.values(this.state.players).filter(player => player.isActive).length;
    },

    findWinner: function() {
        const players = Object.keys(this.state.players).map(id => this.state.players[id]);//Get all players
        let activePlayers = 0;
        let winnerId = "";

        for(let player of players) {//for each player
            if (player.isActive) {
                activePlayers++;
                winnerId = player.id;//If there is only 1 active player then winnerId will become the id of that player
            }
        }
        //if there are more than 1 active players, return "" because no winner, else return that player's id
        return activePlayers === 1 ? winnerId : "";

    }
};

module.exports = gameState;
