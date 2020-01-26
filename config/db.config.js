const mongoose = require("mongoose"),
  mongoURI = process.env.DB_CONNECTION_STRING;

mongoose.connect(
  mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to database");
  }
);
