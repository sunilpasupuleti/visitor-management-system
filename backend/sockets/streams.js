module.exports = function socket(io) {
  io.on("connection", (socket) => {
    socket.on("meeting_update", (data) => {
      io.emit("meeting_updated", data);
    });
  });
};
