Ask AI

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let players = [];
let choices = {};

function determineWinner(p1, p2) {
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

    if (players.length < 2) {
        players.push(socket.id);
        socket.emit("playerNumber", players.length);
    } else {
        socket.emit("roomFull");
        return;
    }

    socket.on("choice", (choice) => {
        choices[socket.id] = choice;

        if (Object.keys(choices).length === 2) {
            const [p1, p2] = players;

            const result = determineWinner(
                choices[p1],
                choices[p2]
            );

            io.emit("result", {
                p1Choice: choices[p1],
                p2Choice: choices[p2],
                result: result
            });

            choices = {};
        }
    });


    socket.on("disconnect", () => {

        players = players.filter(id => id !== socket.id);


        choices = {};

        console.log("User disconnected");

    });
    

});

const PORT= process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});