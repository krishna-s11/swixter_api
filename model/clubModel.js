const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema(
  {
    mainImage: {
      type: String,
      default:
        "https://thumbs.dreamstime.com/z/club-banner-round-brilliants-91976707.jpg",
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner_name: { type: String },
    clubname: {
      type: String,
      required: true,
    },
    location: {
      type: Object,
    },
    description: {
      type: String,
    },
    image: [
      {
        type: String,
      },
    ],
    video: [
      {
        type: String,
      },
    ],
    clubtype: {
      type: String,
      enum: ["Private Place", "Public Place", "Virtual date"],
    },
    customer: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        payment: { type: Boolean, default: false },
      },
    ],
    isverify: { type: Boolean, default: false },
    introduction: { type: String },
    contact: { type: String },
    email: { type: String },
    website: { type: String },
    reviews: [
      {
        title: String,
        rating: Number,
        created: { type: Date, default: Date.now() },
        desc: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true },
);

const Club = mongoose.model("Club", ClubSchema);

module.exports = Club;
