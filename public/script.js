const socket = io();

let playerNumber = 0;
let myChoice = null;

socket.on("playerNumber", (number) => {
    playerNumber = number;
    console.log("You are player:", number);
});

socket.on("roomFull", () => {
    alert("Maaf, Ruangan sudah penuh!");
});

const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");
const hasil = document.getElementById("hasil");
const battleArea = document.getElementById("battleArea");

const buttons = document.querySelectorAll(".choice-btn");
const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");

let playerScore = 0;
let computerScore = 0;

buttons.forEach(button => {
    button.addEventListener("click", function () {
        myChoice = this.id;
        socket.emit("choice", myChoice);
    });
});

socket.on("result", (data) => {
    battleArea.classList.add("active");

    const isPlayer1 = playerNumber === 1;

    const myChoiceResult = isPlayer1 ? data.p1Choice : data.p2Choice;
    const opponentChoiceResult = isPlayer1 ? data.p2Choice : data.p1Choice;

    playerDisplay.textContent = getIcon(myChoiceResult);
    computerDisplay.textContent = getIcon(opponentChoiceResult);

    let resultText = "";

    if (data.result === "seri") {
        resultText = "Seri!";
    } else if (
        (data.result === "p1" && isPlayer1) ||
        (data.result === "p2" && !isPlayer1)
    ) {
        resultText = "Kamu Menang!";
        playerScore++;
        playerScoreEl.textContent = playerScore;
    } else {
        resultText = "Kamu Kalah!";
        computerScore++;
        computerScoreEl.textContent = computerScore;
    }

    hasil.textContent = resultText;
});

function getIcon(choice) {
    if (choice === "batu") return "✊";
    if (choice === "gunting") return "✌️";
    if (choice === "kertas") return "✋";
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;

    playerScoreEl.textContent = "0";
    computerScoreEl.textContent = "0";

    hasil.textContent = "Hasil akan muncul di sini!";
    battleArea.classList.remove("active");
}
