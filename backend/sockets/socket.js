let io = null;
let socket = null;

module.exports = {
  socket(ioPassed) {
    io = ioPassed;
    io.on("connection", (socketPassed) => {
      socket = socketPassed;
      socket.on("meetingUpdate", (data) => {
        io.emit("meetingUpdated", data);
      });
      // this.meetingUpdateSocket({ io: io, socket: socket });
    });
  },

  async meetingUpdateSocket({ data = null }) {
    if (io && socket && data) {
      io.emit("meetingUpdated", data);
    } else {
      console.log("no data");
    }
  },
};
