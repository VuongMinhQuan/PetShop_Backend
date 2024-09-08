const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const cors = require("cors");
const axios = require("axios");
const dbConnect = require("./Config/dbconnect");
const route = require("./Router");

const port = process.env.PORT || 3000;


dbConnect();

app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

