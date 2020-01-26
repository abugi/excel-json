const mongoose = require("mongoose"),
  resultSchema = new mongoose.Schema({
    reg_no: { type: String, required: true, unique: true },
    student_name: { type: String, required: true },
    student_class: { type: String, required: true },
    school_name: { type: String, required: true },
    subjects_offered: {
      math: { type: Number, required: true },
      english: { type: Number, required: true },
      biology: { type: Number, required: true },
      chemistry: { type: Number, required: true }
    }
  });

//Database model
const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
