const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 
  value: {
    type: Number,
    default:0
  }
})
  const Payment = mongoose.model("Payment", userSchema);
//hum apne Collection ko export kra denge dusre file me use krne ke liye***
module.exports = Payment;