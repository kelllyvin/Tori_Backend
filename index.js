require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.port || 3000;
const userRouter = require("./routes/userRouter");

// middleware
app.use(express.json());

// route
app.get("/", (req, res) => {
  res.status(200).json({ sucess: true, message: "torii Gate server" });
});

app.use("/api/auth", userRouter)

// error route

app.use((req, res) => {
  res.status(404).json({ sucess: false, message: "ROUTE NOT FOUND" });
});

const startserveer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "torigate" });
    app.listen(PORT, () => {
      console.log(`App Running on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startserveer();
