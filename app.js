const express = require("express"),
  app = express(),
  path = require("path"),
  bodyParser = require("body-parser"),
  xlstojson = require("xls-to-json-lc"),
  xlsxtojson = require("xlsx-to-json"),
  port = "3000";

//Initialize database connection
require("./config/db.config");

//Import Result Schema
const Result = require("./models/result.model");

//Result placeholder
let data = [];
let validData = [];
let invalidData = [];

//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

//Import multer configuration
/*
 * Multer is the package responsible for parsing files from client side to the server
 */
const upload = require("./config/multer.config");

/** API path that will upload the files */
app.post("/upload", (req, res) => {
  let exceltojson;

  upload(req, res, err => {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({ error_code: 1, err_desc: "No file passed" });
      return;
    }
    /** Check the extension of the incoming file and
     *  use the appropriate module
     */
    if (
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "xlsx"
    ) {
      exceltojson = xlsxtojson;
    } else {
      exceltojson = xlstojson;
    }

    try {
      exceltojson(
        {
          input: req.file.path,
          output: null, //since we don't need output.json
          lowerCaseHeaders: true
        },
        (err, result) => {
          if (err) {
            return res.json(err);
          }
          data = result;
          res.redirect("/preview");
        }
      );
    } catch (e) {
      res.json("Corupted excel file");
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/preview", async (req, res) => {
  validData = [];
  invalidData = [];
  await data.map(record => {
    if (Object.values(record).indexOf("") == -1) {
      validData.push(record);
    } else {
      invalidData.push(record);
    }
  });

  res.render("preview_result", { validData, invalidData });
});

app.post("/saveresult", (req, res) => {
  validData.forEach(async result => {
    const savedResult = await Result.findOne({
      $and: [{ reg_no: result.reg_no }, { student_class: result.student_class }]
    });
    if (savedResult) {
      await Result.findOneAndDelete({ _id: savedResult._id });
    }

    const newResult = new Result();
    newResult.reg_no = result.reg_no;
    newResult.student_name = result.student_name;
    newResult.student_class = result.student_class;
    newResult.school_name = result.school;
    newResult.subjects_offered = {
      math: parseInt(result.math),
      english: parseInt(result.english),
      biology: parseInt(result.biology),
      chemistry: parseInt(result.chemistry)
    };

    await newResult.save();
    validData = [];
    invalidData = [];
    res.redirect("/");
  });
});

app.get("/checkresultform", (req, res) => {
  res.render("check_result");
});

app.get("/checkresult", async (req, res) => {
  const result = await Result.findOne({ reg_no: req.query.regno });
  res.render("my_result", { result });
});

app.listen(process.env.PORT || port, () => {
  console.log("running on 3000...");
});
