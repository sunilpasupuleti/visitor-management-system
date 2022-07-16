// module.exports = {
//   socket(io) {
//     io.on("connection", (socket) => {
//       this.meetingUpdateSocket({ io: io, socket: socket });
//     });
//   },

//   async meetingUpdateSocket({ io = null, socket = null, data = null }) {
//     console.log(socket.id);

//     if (io && data) {
//       io.emit("meeting_updated", data);
//     }
//   },
// };
