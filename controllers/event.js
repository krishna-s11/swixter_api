const eventModel = require("../model/event");
const Mailsend = require("../helper/mail");
module.exports = {
  async createEvent(req, res) {
    
    try {
      console.log(req.body);
      const { eventName, Startdate, EndDate, accepted_type, location, description, type } =
        req.body;
      if ((!eventName, !accepted_type,!Startdate, !EndDate, !location, !description, !type)) {
        return res.status(400).send("Required data is missing.");
      }
      var mainImage;
      if (req.files && req.files["mainImage"]) {
        for (const uploadedImage of req.files["mainImage"]) {
          mainImage = process.env.Backend_URL_Image + uploadedImage.filename;
        }
      }
console.log(req.files,"ALL FILES")
      let images = [];
      let videos = [];
      if (req.files["images"]) {
        for (const image of req.files["images"]) {
          images.push(`${process.env.Backend_URL_Image}${image.filename}`);
        }
      }
      if (req.files["videos"]) {
        for (const video of req.files["videos"]) {
          videos.push(`${process.env.Backend_URL_Image}${video.filename}`);
        }
      }
      const t = JSON.parse(accepted_type)
      const t2 = JSON.parse(location)
      console.log(t2);
      const data = await eventModel.create({
        ...req.body,
        accepted_type: t,
        images: images,
        mainImage: mainImage,
        videos: videos,
        location:t2,
        userId: req.body.userId,
      });
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        const mailOptions = {
          from: process.env.Nodemailer_id,
          to: process.env.Nodemailer_admin,
          subject: "New Event Created",
          html: `<h4>
            Dear Admin,
            A new event request has been submitted for approval. The event name is ${eventName}.
            Please review the request and take appropriate action.
            Best regards,
            The Event Management Team</h4>`,
        };
        console.log("Notification email sent to admin");
        await Mailsend(req, res, mailOptions);
        return res
          .status(201)
          .send({ message: "Event request submitted for approval." });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async event_verify(req, res) {
    try {
      const { eventId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).send("status Is Required");
      }
      if (!eventId) {
        return re.status(400).send("eventId  Is Required ");
      }
      const exist = await eventModel
        .findOne({ _id: eventId })
        .populate("userId", "username image email");
      if (!exist) {
        return res.status(400).send("event not exist");
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
        const data = await eventModel.findOneAndUpdate(
          { _id: exist._id },
          { isverify: true },
          { new: true }
        );
        Mailsend(req, res, mailOptions);
        return res.status(200).send("Acceptance email sent successfully");
      } else if (status == "reject") {
        const data = await eventModel.findByIdAndDelete(
          { _id: exist._id },
          { new: true }
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
  async find(req, res) {
    try {
      const { q } = req.query;
      const data = await eventModel.find();

      if (q) {
        let result = await eventModel.find({
          $or: [
            { eventName: { $regex: q, $options: "i" } },
            { type: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
          ],
        });
        console.log(q, result);

        return res.status(200).send({ data: result, total:data.length  });
      }
      res.status(200).send({ data, total: data.length });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async get_event(req, res) {
    try {
      const { eventId } = req.params;
      const data = await eventModel
        .findOne({ _id: eventId })
        .populate("userId", " image username");
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async update_event(req, res) {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        return res.status(404).send("required the eventId");
      }
   
      const exist = await eventModel.findOne({ _id: eventId });
      if (!exist) {
        return res.status(404).send("event not found");
      }

      var mainImage;
      if (req.files && req.files["mainImage"]) {
        for (const uploadedImage of req.files["mainImage"]) {
          mainImage = process.env.Backend_URL_Image + uploadedImage.filename;
        }
      }

      let images = [];
      let videos = [];
      if (req.files["images"]) {
        for (const image of req.files["images"]) {
          images.push(`${process.env.Backend_URL_Image}${image.filename}`);
        }
      }
      if (req.files["videos"]) {
        for (const video of req.files["videos"]) {
          videos.push(`${process.env.Backend_URL_Image}${video.filename}`);
        }
      }
      if(Array.isArray(req.body?.images)){
   req.body?.images.map((el)=>images.push(el))}else{
    images.push(req.body?.images)
   }
      if(Array.isArray(req.body?.videos)){
   req.body?.videos.map((el)=>videos.push(el))}else{
    videos.push(req.body?.videos)
   }
 
      const t = JSON.parse(req.body.accepted_type);
      const t2 = JSON.parse(req.body.location)
      const data = await eventModel.findOneAndUpdate(
        { _id: eventId },
        {
          ...req.body,
          images: images,
          accepted_type: t,
          location:t2,
          mainImage: mainImage,
          videos: videos,
        },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async delete_event(req, res) {
    try {
      const { eventId } = req.params;
      if (!eventId || !req.params) {
        return res.status(404).send("EventId is required!");
      }
      const exist = await eventModel.findOne({ _id: eventId });
      if (!exist) {
        return res.status(404).send("Event doesn't exist");
      }
      const data = await eventModel.findByIdAndDelete({ _id: eventId },{new:true});
      if (!data) {
        return res.status(400).send("Something went wrong!");
      } else {
        return res.status(200).send("Event is deleted successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },

  async delPart(req, res) {
    try {
      let eventId = req.body.eventId;
      let userId = req.body.userId;
      if ( !req.body.eventId) {
        return res.status(404).send("EventId is required!");
      }
      if ( !req.body.userId) {
        return res.status(404).send("userId is required!");
      }

      let result = await eventModel.findOneAndUpdate(
        { _id: eventId },
        { $pull: { participants: { user: userId } } },
        { new: true })

        if ( !result || result == null) {
          return res.status(400).send("Something went wrong!");
        }
      
      return res.status(200).send("Participant is deleted successfully");

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async requestParticipant(req, res, next) {
    try {
      console.log(req.user._id);
      const { eventId } = req.params;
      // console.log("Event ID:", eventId);
      const event = await eventModel.findById(eventId);
      // console.log("Event:", event);
      if (!event) {
        return res.status(404).send("Event not found");
      }

      const userIdString =
        req.user && req.user._id ? req.user._id.toString() : null;
      console.log("UserID String:", userIdString);
      const participantExists = event.participants.find(
        (participant) =>
          participant.user && participant.user.toString() === userIdString
      );
      console.log("Participant Exists:", participantExists);

      if (participantExists) {
        return res.status(400).send("Participant already added");
      }
      if (event.type == "Public Event") {
        event.participants.push({ user: req.user._id, status: "Approved" });
        await event.save();
        return res.status(200).send(event);
      }
      event.participants.push({ user: req.user._id });
      await event.save();
      res.status(200).send("Participant request sent successfully");
    } catch (error) {
      console.error(error);
      return next(error);
    }
  },
  async updateParticipantStatus(req, res, next) {
    const { eventId, userId } = req.params;
    const { status } = req.body;
    try {
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      const participant = event.participants.find(
        (p) => p.user.toString() === userId
      );
      console.log(participant)
      if (!participant) {
        return res.status(404).send("user not found");
      }
      if (status == "Rejected") {
        event.participants.pull({ user: userId });
        await event.save();
        return res.status(200).send(event);
      } else if (status == "Approved") {
        participant.status = "Approved";
        await event.save();
        return res.status(200).send(event);
      }
    } catch (error) {
      console.error(error);
      return next();
    }
  },
};
