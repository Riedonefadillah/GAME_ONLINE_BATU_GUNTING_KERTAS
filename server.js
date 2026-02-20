const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "public")));

let players = [];
let choices = {};
let usernames = {};

function determineWinner(p1, p2) {
    if (!p1 || !p2) return null;

    if (p1 === p2) return "seri";

    if (
        (p1 === "batu" && p2 === "gunting") ||
        (p1 === "gunting" && p2 === "kertas") ||
        (p1 === "kertas" && p2 === "batu")
    ) {
        return "p1";
    }

    return "p2";
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (username) => {
        usernames[socket.id] = username;

        if (players.length < 2) {
            players.push(socket.id);
            socket.emit("playerNumber", players.length);
        } else {
            socket.emit("roomFull");
        }
    });

    socket.on("choice", (choice) => {
        choices[socket.id] = choice;

        if (players.length === 2 && Object.keys(choices).length === 2) {
            const [p1, p2] = players;

            const p1Choice = choices[p1];
            const p2Choice = choices[p2];

            const result = determineWinner(p1Choice, p2Choice);

            io.emit("result", {
                p1Choice : p1Choice,
                p2Choice: p2Choice,
                result,
                p1Name: usernames[p1],
                p2Name: usernames[p2]
            });

            choices = {};
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        players = players.filter(id => id !== socket.id);

        delete choices[socket.id];
        delete usernames[socket.id];

        choices = {};

    });

});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});