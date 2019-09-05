import express from "express"
import http from "http"
import SocketIO from "socket.io-client"

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 8080 // 3001

app.use("*", express.static(__dirname + "/src"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/public/index.html");
});

io.on("connection", (socket) => {
  console.log("A new user connected!");

  socket.on("disconnect", () => {
    console.log("User disconnected!");
  });
});

server.listen(port, () => {
  console.log("Listening on: " + port);
});