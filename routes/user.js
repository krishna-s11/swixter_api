const express = require("express")
const router = express.Router();

const {
  verifyToken
} = require("../helper/middleware");
const upload = require("../helper/multer");
const { signUpSignInLimiter } = require("../middlewares/limiter/limiter");
const userController = require("../controllers/userController");

router.post("/register",signUpSignInLimiter, userController.signup);
router.post("/login",signUpSignInLimiter, userController.login);
router.get("/active",verifyToken,userController.userLoggedIN)
router.post("/user_verify/:id", userController.user_verify);
router.post("/forget", userController.forget);
router.post("/verifyOtp", userController.verifyOtp);
router.post("/reset_pass", userController.reset_pass);
router.put(
  "/update",
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  userController.update
);
router.get("/findOne/:id", userController.findOne);
router.get("/search_user", userController.search_user);
router.post("/logout/:id", userController.logout);
router.put("/changePassword",verifyToken, userController.changePassword);
router.get("/user_details/:id", userController.userdetail);
router.put(
  "/upload_image/:userId",
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  userController.upload_image
);
router.post(
  "/visited-users",
  userController.visitedUsers
);
router.get("/recentusers", userController.recentUsers);

module.exports = router;
