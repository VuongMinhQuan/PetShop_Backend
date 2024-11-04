const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Message = require("./Model/Message/Message.Model");
const User = require("./Model/User/User.Model");
const bodyParser = require("body-parser");
const app = express();

const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const dbConnect = require("./Config/dbconnect");
const route = require("./Router");

const port = process.env.PORT || 3000;

const server = http.createServer(app);
// Tích hợp Socket.io
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  },
});


dbConnect();

app.use(
  cors({
    origin: ["http://localhost:8080"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Sử dụng route từ router/index.js
route(app);

// Cấu hình body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication token is required."));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = decoded.userId; // Lưu userId vào socket
    next();
  } catch (err) {
    return next(new Error("Invalid token."));
  }
});
// Socket.IO logic
io.on("connection", (socket) => {
  //console.log("New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("sendMessage", async (messageData) => {
    let { senderId, receiverId, content, senderName } = messageData;
    try {
      // Nếu receiverId là "admin", chọn một admin ngẫu nhiên
      if (receiverId === "admin") {
        const admins = await User.find({ "ROLE.ADMIN": true }).select("_id");
        if (admins.length > 0) {
          const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
          receiverId = randomAdmin._id; // Chọn một admin ngẫu nhiên
        } else {
          console.error("No admins found.");
          return;
        }
      }
      // Tạo và lưu tin nhắn mới
      const message = new Message({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        content,
      });
      await message.save();
      // Gửi tin nhắn tới người nhận và người gửi
      io.to(receiverId.toString()).emit("receiveMessage", {
        senderId,
        receiverId,
        content,
        senderName,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}`);
});

