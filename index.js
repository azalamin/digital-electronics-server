const cors = require("cors");
const express = require("express");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

// use middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Digital Electronics Server is running");
});

app.listen(port, () => {
  console.log("Listening to the port", port);
});