const mongoose = require("mongoose");
const travelSchema = new mongoose.Schema({
  image: { type: String },
  // age: { type: String },
  // age2:{ type: String },
  name: { type: String },
  locationto: Object,
  startDate: { type: String },
  resort: {type: String},
  endDate: { type: String },
  interested: [{ type: String }],
  description: { type: String },
  // userInfo :{type:String},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isVerify: { type: Boolean, default: false },
});
const travel = mongoose.model("travel", travelSchema);
module.exports = travel;
