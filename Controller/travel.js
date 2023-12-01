const travelModel = require("../Model/travel");
const nodemailer = require("nodemailer");
const userModel = require("../Model/usersModel");
const Mailsend = require("../helper/mail");

module.exports = {
  async createtravel(req, res) {
    try {
      console.log(req.body, "jgiojgisdfjfgijsdiogjsdiogiosdfhiodhfi");
      const {
        // age,
        // age2,
        name,
        locationto,
        userId,
        startDate,
        endDate,
        interested,
        description,
        image,
        userInfo,
      } = req.body;
      if (
        // !age,
        // !userInfo,
        (!name,
        !locationto,
        !userId,
        !startDate,
        !endDate,
        !interested,
        !description)
        // !image
      ) {
        return res.status(400).send("required the missing data");
      }
      // let image = null;
      // if (req.file) {
      //   image = process.env.Backend_URL_Image + req.file.filename;
      // }
      const userExist = await userModel.findOne({ _id: userId });
      if (!userExist) {
        return res.status(400).send("user not exist");
      }
      const t2 = JSON.parse(locationto);
      const t = JSON.parse(interested);
      const data = await travelModel.create({
        ...req.body,
        image: image,
        locationto: t2,
        userName: name,
        userId: userExist._id,
        interested: t,
        // userInfo:userInfo
      });
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        const email = userId.email;
        const mailOptions = {
          from: process.env.Nodemailer_id,
          to: process.env.Nodemailer_admin,
          subject: "New Travel Created",
          html: `<h4>
          Dear Admin,
          A new Travel request has been submitted for approval. The Travel created by ${userId.username}.
          Please review the request and take appropriate action.
          Best regards,
          The Travel Management Team</h4>`,
        };
        console.log("Notification email sent to admin");
        Mailsend(req, res, mailOptions);
        return res
          .status(201)
          .json({ message: "Travel request submitted for approval." });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async search_travel(req, res) {
    try {
      const { q } = req.query;
      const data = await travelModel.find().populate("userId", "-password");
      if (q) {
        const result = await travelModel
          .find({
            $or: [
              { interested: { $regex: q, $options: "i" } },
              { person_1_age: { $regex: q, $options: "i" } },
              { person_2_age: { $regex: q, $options: "i" } },
              { location: { $regex: q, $options: "i" } },
            ],
          })
          .populate("userId", "-password");
        return res.status(200).send(result);
      }
      return res.status(200).send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async findOne(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).send("travelId is required");
      }
      const data = await travelModel
        .findOne({ _id: id })
        .populate("userId", "-password");
      if (!data) {
        return res.status(400).send("travel not exist");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async update_travel(req, res) {
    try {
      const { travelId } = req.query;
      if (!travelId) {
        return res.status(400).send("travelId is required");
      }
      const exist = await travelModel.findOne({ _id: travelId });
      if (!exist) {
        return res.status(400).send("travelId not exist");
      }
      let image = null;
      if (req.file) {
        image = process.env.Backend_URL_Image + req.file.filename;
      } else {
        image = exist.image;
      }
      const loc = JSON.parse(req.body.locationto);
      const inter = JSON.parse(req.body.interested);
      const data = await travelModel.findOneAndUpdate(
        { _id: exist._id },
        { ...req.body, image: image, interested: inter, locationto: loc },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("data update successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async delete_travel(req, res) {
    try {
      const { travelId } = req.params;
      if (!travelId) {
        return res.status(400).send("travelId is requires");
      }
      const exist = await travelModel.findOne({ _id: travelId });
      if (!exist) {
        return res.status(400).send("travel not exist");
      }
      const data = await travelModel.findByIdAndDelete({ _id: exist._id });
      if (!data) {
        return res.status(400).send("something wen wrong");
      } else {
        return res.status(200).send("travel delete successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  },
  async travel_verify(req, res) {
    try {
      const { travelId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).send("status Is Required");
      }
      if (!travelId) {
        return re.status(400).send("travelId  Is Required ");
      }
      const exist = await travelModel
        .findOne({ _id: travelId })
        .populate("userId", "username image email");
      if (!exist) {
        return res.status(400).send("travel not exist");
      }
      let text = "";
      if (status == "accept") {
        text = "Congratulations! Your account registration has been accepted.";
      } else {
        text = "Your account registration has been rejected.";
      }
      let email = exist.userId.email;
      console.log(email);

      const mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: "Account registration",
        html: `<h4>${text}</h4>`,
      };
      if (status == "accept") {
        const data = await travelModel.findOneAndUpdate(
          { _id: exist._id },
          { isverify: true },
          { new: true },
        );
        Mailsend(req, res, mailOptions);
        return res.status(200).send("Acceptance email sent successfully");
      } else if (status == "reject") {
        const data = await travelModel.findByIdAndDelete(
          { _id: exist._id },
          { new: true },
        );
        Mailsend(req, res, mailOptions);
        return res.status(200).send("Rejection email sent successfully");
      } else {
        return res.status(400).send("something went wrong");
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  },
};
