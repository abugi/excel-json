const mongoose = require("mongoose"),
  mongoURI = "mongodb://abugi:jankara@ds121535.mlab.com:21535/greenbrainfinal";

mongoose.connect(
  mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to database");
  }
);
