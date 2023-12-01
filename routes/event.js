const express = require("express");
const router = express.Router();
const eventController = require("../Controller/event");
const {
  verifyToken,
  verifyAdmin,
  verifyUser,
} = require("../helper/middleware");
const upload = require("../helper/multer");
router.post(
  "/event_verify/:eventId",
  verifyAdmin,
  eventController.event_verify,
);
router.post(
  "/createEvent",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  eventController.createEvent,
);
router.get("/events", eventController.find);
router.get("/get_event/:eventId", eventController.get_event);
//delete particular event's particepent
router.post("/delPart", eventController.delPart);

router.put(
  "/update_event/:eventId",
  verifyToken,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  eventController.update_event,
);
router.delete("/delete_event/:eventId", eventController.delete_event);
router.post(
  "/events/:eventId/participants",
  verifyToken,
  eventController.requestParticipant,
);
router.post(
  "/events/:eventId/:userId",
  verifyToken,
  eventController.updateParticipantStatus,
);

module.exports = router;
