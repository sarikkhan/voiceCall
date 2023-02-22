var socket = io();
const myPeer = new Peer(CURRENT_USER_ID);
const videoGrid = document.getElementById("video-grid");
console.log("reached here");
const peers = {};
var count = 0;
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const myVideo = document.createElement("video");
myVideo.muted = true;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    console.log("hello");
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId, startTime) => {
      console.log("user is connected");
      socket.emit("user-connected-checking", userId, startTime);

      connectToNewUser(userId, stream);
    });
    socket.on("get_first_user_id", (uId) => {
      socket.emit("assign_first_user_id", uId);
    });
    socket.on("room-full", (messaage) => {
      alert(messaage);
    });
  });

socket.on("user-disconnected", (userId) => {
  window.location = "http://localhost:2000/profile";
  alert("User is disconnected");
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
  count++;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.play();
  // video.addEventListener("loadedmetadata", () => {
  //   video.play();
  // });
  videoGrid.append(video);
}
