const url = "ws://172.24.164.168:8765";

const winScore = 5;

let playerOneScore = 0;
let playerTwoScore = 0;

let playerOneSets = 0;
let playerTwoSets = 0;

let elementPlayerOneScore;
let elementPlayerTwoScore;
let elementPlayerOneSets;
let elementPlayerTwoSets;


function setup_display() {
    elementPlayerOneScore = document.querySelector("#scoreboard>.player-one");
    elementPlayerTwoScore = document.querySelector("#scoreboard>.player-two");

    elementPlayerOneSets = document.querySelector("#sets>.player-one");
    elementPlayerTwoSets = document.querySelector("#sets>.player-two");

    render();
}

function processEvent(data) {
    console.log("<<< " + data);

    if (data === "0xff30cf") {
        playerOneScore++;
    }
    if (data === "0xff10ef") {
        playerOneScore--;
    }
    if (data === "0xff7a85") {
        playerTwoScore++;
    }
    if (data === "0xff5aa5") {
        playerTwoScore--;
    }

    if (data === "0xffa25d") {
        playerOneScore = 0;
        playerTwoScore = 0;
        playerOneSets = 0;
        playerTwoSets = 0;
    }

    if (hasWinner()) {
        if (playerOneScore > playerTwoScore) {
            playerOneSets++;
        } else {
            playerTwoSets++;
        }
        playerOneScore = 0;
        playerTwoScore = 0;
    }
    render();

}

function hasWinner() {
    if (playerOneScore >= winScore && playerTwoScore <= playerOneScore - 2 || playerTwoScore >= winScore && playerOneScore <= playerTwoScore - 2) {
        return true;
    }
    else {
        return false;
    }
}

function render() {
    console.log("Score: " + playerOneScore + ":" + playerTwoScore);
    console.log("Sets: " + playerOneSets + ":" + playerTwoSets);

    let output = document.getElementById("outputfield");
    output.innerHTML = `
    Current score: ${playerOneScore}:${playerTwoScore}
    <br>
    Sets: ${playerOneSets}:${playerTwoSets}
    `;

    elementPlayerOneScore.innerHTML = playerOneScore;
    elementPlayerTwoScore.innerHTML = playerTwoScore;
    elementPlayerOneSets.innerHTML = playerOneSets;
    elementPlayerTwoSets.innerHTML = playerTwoSets;

}

document.addEventListener("DOMContentLoaded", () => {

    console.log("Hello world! Starting 🏓-Display…");

    setup_display();

    const webSocket = new WebSocket(url);

    webSocket.addEventListener("open", function () {
        console.log("Successfully connected to server! 🎉");
    });
    webSocket.addEventListener("message", function (event) {
        processEvent(event.data);
    });
    webSocket.addEventListener("close", function () {
        console.log("Connection has been closed. 🥀");
    });
});
