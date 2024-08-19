const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/PetShop";

const dbConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Successfully connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err);
    });
};

module.exports = dbConnect;
