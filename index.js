const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const dbConnect = require("./Config/dbconnect");
const route = require("./Router");

dbConnect();

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
