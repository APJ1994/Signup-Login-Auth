const conn = require("./conn");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = 3200;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Availble Routes
app.use('/api/auth',require('./routes/auth'));

app.listen(port, () => {
  console.log(`Server is running Port ${port}`);
});
