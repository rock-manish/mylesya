const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
 
  Counts: {
    type: Number,
    default:1
  }
})
  const Count = mongoose.model("Count", userSchema);
//hum apne Collection ko export kra denge dusre file me use krne ke liye***
module.exports = Count;