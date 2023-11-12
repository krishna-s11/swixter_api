require("dotenv").config();
const express = require("express");
const Database = require("./config/database");
const cookieParser = require('cookie-parser')
const userroutes = require("./routes/user")
const event = require("./routes/event")
const CLIENT_URL=process.env.CLIENT_URL
const app = express();

const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/error/errorMiddleware");

const PORT = process.env.PORT || 5000;

const db = new Database(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  db.connect().catch((err) =>
    console.error("Error connecting to database:", err)
  );


app.use(morgan("dev"));
app.use(express.static("public"))
app.use("images", express.static("uploads"))
app.use("images", express.static("images"))
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:[CLIENT_URL,"http://localhost:3000"],
    credentials:true
}));
app.use(express.urlencoded({ extended: true }));

app.use("/api", userroutes, event);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is up and running!" });
});
  
  process.on("SIGINT", async () => {
    try {
      await db.disconnect();
      console.log("Disconnected from database.");
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
  
  app.listen(PORT, () => console.log(`Server up and running on port ${PORT}!`));

app.use(notFound);
app.use(errorHandler);