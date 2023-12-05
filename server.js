const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
dotenv.config();
const PORT = process.env.PORT;
const db = require("./Connection/connection");
app.use(express.static("public"));
app.use("images", express.static("uploads"));
app.use("images", express.static("images"));
const path = require("path");
const clubroutes = require("./Routes/clubRoutes");
const userroutes = require("./Routes/userRoutes");
const event = require("./Routes/event");
const travel = require("./Routes/travel");
const faq = require("./Routes/faq");
app.use(express.json());
var corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://hot-date.vercel.app",
    "https://swinxter-v2.vercel.app",
  ],
  credentials: true,
};
//added

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  "/api",
  userroutes,
  event,
  travel,
  clubroutes,
  faq,
);
db();
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// const socketIo = require('socket.io');
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
