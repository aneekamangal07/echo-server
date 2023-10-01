const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: {
    origin: "https://echo-client.vercel.app/",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);
  socket.on("room:join", (data) => {
    // console.log(data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ansCall }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ansCall });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ansCall }) => {
    console.log("peer:nego:done", ansCall);
    io.to(to).emit("peer:nego:final", { from: socket.id, ansCall });
  });
});
