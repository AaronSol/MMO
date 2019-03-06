let socket = io();

//Get elements from HTML
let playerList = document.getElementById('players');
let btn = document.getElementById("btn");
let getPlayers = document.getElementById("getAllPlayerInfo");


socket.on('connect', function () {
    let yourId = document.getElementById("your-id");
    yourId.innerHTML = "Your socket id is " + socket.id;
});


socket.on('receivePlayers', players => {
    console.log(playerList);
    let result = "";
    //Loop through all the players in gamestate
    for (let id of Object.keys(players)) {
        let name = players[id].name;
        let isActive = players[id].isActive;
        result += "<div style='border: black solid 1px'>player id: " + id + "<br>Name: " + name + "<br>isActive: " + isActive +"<br></div>";
    }
    playerList.innerHTML = result;

});




getPlayers.addEventListener("click",() => {
    socket.emit('getPlayers');
});

btn.addEventListener("click",() => {
    let createName = document.getElementById("createPlayerName");
    let nameOnForm = createName.value;
    socket.emit('createName', {id: socket.id, namePlayerInputed: nameOnForm});
    createName.value = "";
});
