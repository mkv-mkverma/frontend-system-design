const express = require("express");
const app = express();
const port = 3000;

const { createServer } = require("node:http");
const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chatMessage", (message) => {
    console.log("chatMessage: " + message);
    io.emit("chatMessage", message); // Broadcast the message to all clients
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
