const express = require("express");
const cors = require("cors");
const colors = require("colors");
const socketio = require("socket.io");
const ACTIONS = require("./Actions");
const dotenv = require("dotenv").config();
const http = require("http");
const errorHandler = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const Space = require("./models/spaceSchema");
connectDB();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options("*", cors());
app.use("/spaces", require("./routes/spaceRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/code", require("./routes/runRoutes"));
app.use(errorHandler);

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  // User joins to space
  socket.on(ACTIONS.JOIN, async ({ spaceId, email, name }) => {
    try {
      socket.join(spaceId);
  
      const space = await Space.findOne({ spaceId });
  
      if (!space) {
        console.log("Space not found!");
        return;
      }
  
      // Check if the user is already in activeUsers
      const isUserAlreadyActive = space.activeUsers.some(user => user.email === email);
  
      if (!isUserAlreadyActive) {
        // Add user if not already present
        const updatedSpace = await Space.findOneAndUpdate(
          { spaceId },
          { $push: { activeUsers: { name, email } } },
          { new: true }
        );
  
        io.to(spaceId).emit(ACTIONS.JOINED, updatedSpace.activeUsers);
      } else {
        // If user already exists, just emit the current active users list
        io.to(spaceId).emit(ACTIONS.JOINED, space.activeUsers);
      }
    } catch (e) {
      console.log(e);
    }
  });
  

  //Users leaves space
  socket.on(ACTIONS.LEAVE, async ({ spaceId, name, email }) => {
    try {
      const res = await Space.findOneAndUpdate(
        { spaceId },
        { $pull: { activeUsers: { name, email } } },
        { new: true }
      );

      socket.broadcast
        .to(spaceId)
        .emit(ACTIONS.LEFT, { activeUsers: res.activeUsers, name });
      socket.leave(spaceId);
    } catch (e) {
      console.log(e);
    }
  });

  // CODE change
  socket.on(ACTIONS.CODE_CHANGE, ({ spaceId, change }) => {
    socket.broadcast.to(spaceId).emit(ACTIONS.SYNC_CODE, { change });
  });

  socket.on(
    ACTIONS.FILE_METADATA_CHANGE,
    async ({ spaceId, fileLang, fileName }) => {
      const res = await Space.findOne({ spaceId });
      res.spaceData[0].fileLang = fileLang;
      res.spaceData[0].fileName = fileName;
      await res.save();

      socket.broadcast
        .to(spaceId)
        .emit(ACTIONS.SYNC_FILE_METADATA, { fileName, fileLang });
    }
  );
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
