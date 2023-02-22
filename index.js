const express = require("express");

require("./config/firebaseConfig");
const callLogs = require("./controllers/callLogs");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cookieParser = require("cookie-parser");

// const server = require("http").Server(app);
// const io = require("socket.io")(server);
// const { v4: uuidV4 } = require("uuid");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));
// const authentication = require("./controllers/authentication");
// const { Socket } = require("engine.io");

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/", require("./routes/index.js"));

io.on("connection", (socket) => {
  let startTime = 0;
  let endTime = 0;
  let type = "called";
  let otherUser = null;
  socket.on("join-room", (roomId, userId) => {
    let numUser = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    console.log("kkkkkk", numUser);
    if (numUser == 2) {
      socket.emit("room-full", "Sorry this room is full");
      return;
    }
    if (numUser == 1) {
      type = "received";
    }
    startTime = new Date();
    socket.join(roomId);

    socket.broadcast.to(roomId).emit("user-connected", userId, startTime);

    socket.on("user-connected-checking", (otherUserId, startTime) => {
      otherUser = otherUserId;
      startTime = startTime;
      socket.broadcast.to(roomId).emit("get_first_user_id", userId);
    });
    socket.on("assign_first_user_id", (uid) => {
      otherUser = uid;
    });
    socket.on("disconnect", () => {
      var numUserDisconnect = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      if (otherUser == null) {
        callLogs.addData(userId, "0", startTime, "not Connected", "", roomId);
      } else if (numUserDisconnect == 1) {
        endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        callLogs.addData(userId, duration, startTime, type, otherUser, roomId);
        callLogs.addContact(userId, otherUser);
      }

      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});
server.listen(2000);
