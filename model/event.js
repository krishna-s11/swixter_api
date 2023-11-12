const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  mainImage:{ type: String,default:"https://cdn.vectorstock.com/i/1000x1000/94/91/special-events-icon-vector-16319491.jpg"},
  userId:{ type: mongoose.Schema.Types.ObjectId,ref: "User"},
    eventName: { type: String},
    Startdate: { type: String },
    EndDate:{type:String},
    contact:{type:String},
    location: Object,
    description: { type: String },
    images: [{ type: String }],
    videos: [{ type: String }],
    type: { type: String, enum: ["Private Event", "Public Event", "Virtual Event"] },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
      }],
      accepted_type:[{ type: String}],
      isPromoted: { type: Boolean, default: false },
      isverify:{type: Boolean, default: false }
    });

const event = mongoose.model("event", eventSchema);

module.exports = event;
