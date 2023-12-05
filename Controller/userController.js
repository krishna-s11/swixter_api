const userModel = require("../Model/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Mailsend = require("../helper/mail");
const {
  mailHtml,
  forgetMail,
  change_passMail,
} = require("../helper/mail_html");
const mongoose = require("mongoose");
const SECRET_KEY = process.env.JWT_SECRETKEY;

module.exports = {
  async signup(req, res) {
    const { email, password, username, profile_type, logintype } = req.body;
    console.log("dsfj");
    if (!logintype) {
      try {
        if (!profile_type || !email || !username) {
          return res
            .status(400)
            .send("Please provide all the required information.");
        }
        const exist = await userModel.findOne({ email: email });
        if (exist) {
          return res.status(400).send("User with this email already exists.");
        }
        const username_exist = await userModel.findOne({ username: username });
        if (username_exist) {
          return res.status(400).send("Username is already taken.");
        }
        const hash_password = await bcrypt.hash(password, 10);
        const data = await userModel.create({
          ...req.body,
        });
        data.password = hash_password;
        await data.save();
        console.log(hash_password);
        if (!data) {
          return res.status(400).send("Failed to create the user.");
        } else {
          console.log(data, "=============");

          const verificationLink = `${process.env.EmailVerify_link}${data._id}`;
          let bodyData = { email: data.email, name: data.username };
          let emailHtml = mailHtml(
            bodyData,
            verificationLink,
            `<h4> Thank you for registering on Hot Date App! We're excited to have you join our community.</h4>`,
          );
          let mailOptions = {
            from: process.env.Nodemailer_id,
            to: data.email,
            subject: "user verify",
            html: emailHtml,
          };
          Mailsend(req, res, mailOptions);
          return res.status(201).send(data);
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      try {
        const exist = await userModel.findOne({ email });
        if (exist) {
          const token = jwt.sign(
            { _id: exist._id, email: exist.email, role: exist.role },
            SECRET_KEY,
            {
              expiresIn: "30d",
              expiresIn: "30d",
            },
          );
          exist.token = token;
          exist.save();
          return res.status(200).send({ statusCode: 200, Message: token });
        } else {
          const data = await userModel.create({
            email: email,
            username: username,
            logintype: logintype,
            isVerify: true,
          });
          console.log(data);
          const verificationLink = `${process.env.EmailVerify_link}${data._id}`;
          let bodyData = { email: data.email, name: data.username };
          let emailHtml = mailHtml(
            bodyData,
            verificationLink,
            `<h4> Thank you for registering on Hot Date App! We're excited to have you join our community.</h4>`,
          );
          let mailOptions = {
            from: process.env.Nodemailer_id,
            to: data.email,
            subject: "user verify",
            html: emailHtml,
          };
          Mailsend(req, res, mailOptions);
          const token = jwt.sign(
            { _id: exist._id, email: exist.email, role: exist.role },
            SECRET_KEY,
            {
              expiresIn: "30d",
              expiresIn: "30d",
            },
          );
          data.token = token;
          data.save();
          if (!data) {
            return res.status(400).send("Failed to create the user.");
          } else {
            res.status(201).send({ statusCode: 201, Message: token });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  },
  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).send("Please Provide Required Information");
      }
      const exist = await userModel.findOne({ email });
      if (!exist) {
        return res.status(400).send("User doesn't exist");
      }
      if (exist.isVerify == false) {
        return res.status(400).send("Email is not verified");
      }
      const match = await bcrypt.compare(password, exist.password);
      if (!match) {
        return res.status(400).send("Your password is wrong");
      } else {
        const token = jwt.sign(
          { _id: exist._id, email: exist.email, role: exist.role },
          SECRET_KEY,
          {
            expiresIn: "10d",
          },
        );
        exist.isLogged = true;
        await exist.save();
        const options = {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        };

        return res
          .status(200)
          .cookie("token", token, options)
          .send({ data: exist, token: token });
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  async login4(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).send("Please Provide Required Information");
      }
      const exist = await userModel.findOne({ email });
      if (!exist) {
        return res.status(400).send("User doesn't exist");
      }
      if (exist.isVerify == false) {
        return res.status(400).send("Email is not verified");
      }
      const match = await bcrypt.compare(password, exist.password);
      if (!match) {
        return res.status(400).send("Your password is wrong");
      } else {
        const token = jwt.sign(
          { _id: exist._id, email: exist.email, role: exist.role },
          SECRET_KEY,
          {
            expiresIn: "365d",
          },
        );
        exist.isLogged = true;
        await exist.save();
        const options = {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        };

        return res
          .status(200)
          .cookie("token", token, options)
          .send({ data: exist, token: token });
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  },

  async userLoggedIN(req, res) {
    try {
      const findUser_Status = await userModel.findById(req.user._id);
      if (findUser_Status.isLogged) {
        return res.status(200).send(findUser_Status);
      } else {
        return res.status(403).send({ message: "You have to login first!" });
      }
    } catch (err) {
      console.log(err, "NOW");
      return res.status(500).send(err);
    }
  },

  async activeUsers(req, res) {
    try {
      console.log(req.user);
      const findUsers = await userModel.find({ isLogged: true });
      if (findUsers.length !== 0) {
        res.status(200).send({ success: true, users: findUsers });
      } else {
        res.status(200).send({ message: "No user found!" });
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  async RecentUsers(req, res) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = await userModel
        .find({ createdAt: { $gte: thirtyDaysAgo } })
        .sort({ createdAt: -1 });

      if (recentUsers.length !== 0) {
        res.status(200).send({ success: true, users: recentUsers });
      } else {
        res.status(200).send({ message: "No recent users found!" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const data = await userModel.findOne({ _id: id }).select("-password ");
      if (!data) {
        return res.status(400).send("Something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  },
  async upload_image(req, res) {
    const { userId } = req.params;
    console.log("running image upload")
    try {
      if (!userId) {
        return res.status(400).send("userId is required");
      }
      const exist = await userModel.findOne({ _id: userId });
      console.log(exist);
      if (!exist) {
        return res.status(404).send("User doesn't exist");
      }
      let image = "";
      console.log(req.files);
      if (req.files) {
        image = `${process.env.Backend_URL_Image}${req.files.image[0].filename}`;
      } else {
        image = "";
      }
      let images = exist.images;
      let videos = exist.videos;
      // Check if images were uploaded
      if (req.files && req.files["images"]) {
        for (const uploadedImage of req.files["images"]) {
          images.push(
            `${process.env.Backend_URL_Image}${uploadedImage.filename}`,
          );
        }
      }
      if (req.files && req.files["videos"]) {
        for (const uploadedvideos of req.files["videos"]) {
          videos.push(
            `${process.env.Backend_URL_Image}${uploadedvideos.filename}`,
          );
        }
      }
      const data = await userModel.findByIdAndUpdate(
        { _id: exist._id },
        {
          image: image,
          images: images,
          videos: videos,
        },
        { new: true },
      );
      console.log(data);
      if (!data) {
        return res.status(400).send("Failed to Upload Image");
      } else {
        return res.status(200).send(data);
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async update(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(404).send("required the userId");
      }
      const exist = await userModel.findOne({ _id: userId });
      if (!exist) {
        return res.status(404).send("model not found");
      }
      console.log(exist);
      if (exist.profile_type == "single") {
        const data = await userModel.findOneAndUpdate(
          { _id: userId },
          {
            ...req.body,
          },
          { new: true },
        );
        console.log(data.image);

        if (!data.image) {
          console.log("HIOP");
        }

        if (req.body.interests) {
          data.interests = JSON.parse(req.body?.interests);
        }

        await data.save();
        return res.status(200).send(data);
      } else if (exist.profile_type == "couple") {
        const data = await userModel.findOneAndUpdate(
          { _id: userId },
          {
            ...req.body,
          },
          { new: true },
        );
        if (req.body.interests) {
          data.interests = JSON.parse(req.body.interests);
        }
        if (req.body.couple) {
          data.couple = JSON.parse(req.body.couple);
        }
        await data.save();
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async delete_user(req, res) {
    try {
      const data = await userModel.findOneAndDelete({ _id: req.params.id });
      return res.status(200).send("User delete successfully");
    } catch (e) {
      return res.status(500).send(e);
    }
  },
  async search_user(req, res) {
    try {
      const { q } = req.query;
      const data = await userModel.find({ role: "user" }).select("-password ");
      if (q) {
        const result = await userModel
          .find({
            $or: [
              { role: "user" },
              { username: { $regex: q, $options: "i" } },
              { country: { $regex: q, $options: "i" } },
            ],
          })
          .select("-password");
        return res.status(200).send(result);
      }
      return res.status(200).send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async logout(req, res) {
    try {
      const data = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { token: null, isLogged: false },
        { new: true },
      );
      if (!data) {
        return res.status(404).send({ message: "User not found" });
      }
      return res.status(200).send({ message: "Logout successful" });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async forget(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).send("email is required");
      }
      const userExist = await userModel.findOne({ email: email });
      if (!userExist) {
        return res.status(400).send("User doesn't exist");
      }
      const OTP = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
      });
      let html = forgetMail(userExist.username, OTP);
      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: " Forget Password",
        html: html,
      };
      console.log(OTP);
      await userModel.findOneAndUpdate(
        { _id: userExist._id },
        { otp: OTP },
        { new: true },
      );
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async verifyOtp(req, res) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).send("otp is required");
      }
      const userExist = await userModel.findOne({ otp: otp });
      if (!userExist) {
        return res.status(400).send("You Entered Wrong OTP");
      }
      const date = userExist.updatedAt;
      var currentdate = new Date();
      let mint = date.getMinutes() + 2;
      let curtMint = currentdate.getMinutes();
      if (mint <= curtMint) {
        return res.status(400).send("expired otp");
      }
      if (userExist) {
        const deleteotp = await userModel.findOneAndUpdate(
          { _id: userExist._id },
          { otp: "" },
          { new: true },
        );
        console.log(deleteotp);
        if (deleteotp) {
          return res.status(200).send("verify otp seccess");
        }
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async reset_pass(req, res) {
    try {
      const { email, new_password, confirm_password } = req.body;
      if ((!new_password, !confirm_password)) {
        return res.status(400).send("required the data");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("Enter the same password");
      }
      const hash = await bcrypt.hashSync(confirm_password, 10);
      console.log(confirm_password);
      const data = await userModel.findOneAndUpdate(
        { email: email },
        { password: hash },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        let title = "Reset Password";
        let html = change_passMail(
          title,
          data.username,
          " Your password is changed successfully please login with your newly created credentials",
        );
        let mailOptions = {
          from: process.env.Nodemailer_id,
          to: email,
          subject: title,
          html: html,
        };
        Mailsend(req, res, mailOptions);
        return res.status(200).send("reset password successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async changePassword(req, res) {
    try {
      const { old_password, new_password, confirm_password } = req.body;
      if ((!old_password, !new_password, !confirm_password)) {
        return res.status(400).send("required the data");
      }
      const get_pass = await userModel.findOne({ _id: req.user._id });
      const password = await bcrypt.compare(old_password, get_pass.password);
      if (!password) {
        return res.status(400).send("wrong old_password");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("enter the same password");
      }
      const hash = bcrypt.hashSync(confirm_password, 10);
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { password: hash },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        let title = "Change Password";
        let html = change_passMail(
          title,
          data.username,
          " Your password is changed successfully please login with your newly created credentials",
        );
        let mailOptions = {
          from: process.env.Nodemailer_id,
          to: get_pass.email,
          subject: title,
          html: html,
        };
        Mailsend(req, res, mailOptions);
        return res.status(200).send("change password successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async userdetail(req, res) {
    try {
      const { id } = req.params;
      const data = await userModel.findById({ _id: id });
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
  async contactUs(req, res) {
    try {
      const { username, email, reason, message } = req.body;
      if ((!username, !email, !reason, !message)) {
        return res.status(400).send("required the data");
      }

      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: process.env.Nodemailer_admin,
        subject: "contactUs",
        text: ` Name : ${username},  Email : ${email} , Reason  : ${reason}, Message : ${message}`,
      };
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async model_mail(req, res) {
    try {
      const user = req.user;
      const email = user._id;
      const verificationLink = `${process.env.EmailVerify_link}${email}`;

      let emailHtml = `
      <!doctype html>
      <html lang="en-US">
      
      <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Email Verification</title>
          <meta name="description" content="Email Verification Template.">
          <style type="text/css">
              a:hover { text-decoration: underline !important; }
          </style>
      </head>
      
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #F2F3F8;" leftmargin="0">
          <!-- 100% body table -->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#F2F3F8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #F2F3F8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="height: 80px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height: 20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height: 40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding: 0 35px;">
                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Email Verification</h1>
                                              <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #CECECE; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Thank you for signing up. Please verify your email address by clicking the button below.</p>
                                              <a  href="${verificationLink}"
                                                  style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email</a>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height: 40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="height: 20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height: 80px;">&nbsp;</td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
          <!-- /100% body table -->
      </body>
      
      </html>
      `;
      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: "model verify",
        html: emailHtml,
      };
      Mailsend(req, res, mailOptions);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async user_verify(req, res) {
    try {
      const exist = await userModel.findOne({ _id: req.params.id });
      if (!exist) {
        return res.status(404).send("user not exist");
      }
      const createdAt = exist.createdAt;
      const currentTime = new Date();
      const timeDifference = currentTime - createdAt;
      const timeDifferenceInHours = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

      if (timeDifferenceInHours > 24) {
        // Delete the user if more than 24 hours have passed
        await userModel.findByIdAndDelete(req.params.id);
        return res
          .status(400)
          .send(
            "Your email verification link has expired. Please sign up again.",
          );
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { isVerify: true },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("user verify successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async subscribe(req, res) {
    try {
      const { modelId } = req.params;
      const exist = await userModel.findOne({ _id: modelId });
      exist.followers.forEach((el) => {
        if (el.toString() == req.user._id) {
          return res.status(400).send("model already subscribe");
        }
      });

      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: exist.email,
        subject: "new subscriber",
        html: `<h4>Hello,${exist.firstName} ${exist.lastName}</h4>
                 \nWe have a new subscribe request. from:\nName: ${req.user.username}\nEmail: ${req.user.email}`,
      };
      exist.followers.push(req.user._id);
      await exist.save();
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async upload_album(req, res) {
    try {
      const { album_name } = req.body;
      let image = [];
      if (req.files) {
        req.files.forEach((file) => {
          console.log(file.path);
          var att = process.env.Backend_URL_Image + file.filename;
          image.push(att);
        });
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { album: [{ name: album_name, images: image }] } },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      }
      return res.status(200).send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async add_img_album(req, res) {
    try {
      const { albumId } = req.params;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("sommething went wrong");
      }
      let image = [];
      if (req.files) {
        req.files.forEach((file) => {
          console.log(file.path);
          var att = process.env.Backend_URL_Image + file.filename;
          image.push(att);
        });
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id, "album._id": albumId },
        { $push: { "album.$.images": image }, ...req.body },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("Error updating the document:");
      } else {
        return res.status(200).send("New image added successfully!");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async del_img_album(req, res) {
    try {
      const { albumId } = req.params;
      const { filename } = req.body;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      if (!filename) {
        return res.status(400).send("filename is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("something went wrong");
      }
      const data = await userModel.findOneAndUpdate(
        { _id: exist._id, "album._id": albumId },
        { $pull: { "album.$.images": filename } },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("Error updating the document:");
      } else {
        return res.status(200).send("file delete successfulliy");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async deleteAlbum(req, res) {
    try {
      const { albumId } = req.params;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("album id is not exist");
      }
      const data = await userModel.findOneAndUpdate(
        { "album._id": convertedAlbumId },
        { $pull: { album: { _id: convertedAlbumId } } },
        { new: true },
      );
      if (!data) {
        return res.status(400).send("album delete successfully");
      } else {
        return res.status(200).send("album delete successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async addwallet(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      if (!amount) {
        return res.status(400).send("amount is required");
      }
      const exist = await userModel.findOne({ _id: id });
      if (!exist) {
        return res.status(404).send("user not found");
      }
      exist.wallet += amount;
      await exist.save();
      return res.status(200).send("amount add successfully");
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async favModel(req, res) {
    try {
      const { userId, status } = req.body;
      const { modelId } = req.params;
      if ((!userId, !modelId)) {
        return res.status(400).send("required the id");
      }
      const userExist = await userModel.findOne({ _id: userId });
      if (!userExist) {
        return res.status(400).send("user not exist");
      }
      const modelExist = await userModel.findOne({ _id: modelId });
      if (!modelExist) {
        return res.status(400).send("model not exist");
      }
      if (status === true) {
        if (userExist.favouriteModels.includes(modelId)) {
          return res.status(200).send("Model is already in favorites");
        }
        userExist.favouriteModels.push(modelId);
        await userExist.save();
        console.log(userExist);
        return res.status(200).send(userExist);
      } else if (status === false) {
        userExist.favouriteModels.pull(modelId);
        await userExist.save();
        console.log(userExist);
        return res.status(200).send(userExist);
      } else {
        return res.status(400).send("something went wrong");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getfavModel(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).send("userId is required");
      }
      const userExist = await userModel.findOne({ _id: userId });
      if (!userExist) {
        return res.status(404).send("user not exist");
      }
      const favModels = await userModel
        .find({ _id: { $in: userExist.favouriteModels } })
        .select("-password -updatedAt -createdAt");
      return res.status(200).send(favModels);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async visitedUsers(req, res, next) {
    const { visitedUserIds } = req.body;
    console.log(visitedUserIds);
    let visitedUsers = [];
    visitedUserIds.map(async id => {
      const data = await userModel.findById({ _id: id })
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        visitedUsers.push(data);
      }
      res.status(200).send(visitedUsers);
    })
  },
  async removeFriend(req, res, next) {
    const { id } = req.params;
    const { friendId} = req.params;
    try{
      const data = await userModel.findById({_id: id});
      const index = data.friends.indexOf(friendId);
      data.friends.splice(index,1);
      console.log(data.friends);
      await data.save();
      res.status(200).send("Friend removed succesfully");
    }catch(e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  async sendFriendRequest(req, res, next) {
    const { id } = req.params;
    const { friendId} = req.params;
    try{
      const send_data = await userModel.findById({_id: id});
      send_data.sent_requests.push(friendId);
      await send_data.save();
      const recieved_req = await userModel.findById({_id: friendId});
      recieved_req.friend_requests.push(id);
      await recieved_req.save();
      res.status(200).send("Friend request sent succesfully");
    }catch(e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  async sentFriendRequest(req, res, next) {
    const { id } = req.params;
    const { friendId} = req.params;
    try{
      const send_data = await userModel.findById({_id: id});
      send_data.sent_requests.push(friendId);
      await send_data.save();
      const recieved_req = await userModel.findById({_id: friendId});
      recieved_req.friend_requests.push(id);
      await recieved_req.save();
      res.status(200).send("Friend request sent succesfully");
    }catch(e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  async cancelFriendRequest(req, res, next) {
    const { id } = req.params;
    const { friendId} = req.params;
    try{
      const send_data = await userModel.findById({_id: id});
      const send_index = send_data.sent_requests.indexOf(friendId);
      send_data.sent_requests.splice(send_index);
      await send_data.save();
      const recieved_req = await userModel.findById({_id: friendId});
      const rcvd_index = recieved_req.friend_requests.indexOf(id);
      recieved_req.friend_requests.splice(rcvd_index);
      await recieved_req.save();
      res.status(200).send("Friend request cancelled succesfully");
    }catch(e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  async accept_req(req, res, next) {
    const { id } = req.params;
    const { friendId} = req.params;
    try{
      const data = await userModel.findById({_id: id});
      const index = data.sent_requests.indexOf(friendId);
      data.friend_requests.splice(index);
      data.friends.push(friendId);
      await data.save();
      res.status(200).send("Friend Added succesfully");
    }catch(e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  async recentUsers(req,res,next){
    let users = [];
    try{
      const data = await userModel.find();
      if(!data){
        return res.status(400).send("something went wrong");
      }
      else{
        return res.status(200).send(data);
      }
    }
    catch(e){
      console.log(e);
      return res.status(500).send(e);
    }
  }
};

// const MERCHANT_ID = "YOUR_MERCHANT_ID";
// const MERCHANT_KEY = "YOUR_MERCHANT_KEY";
// const WEBSITE = "YOUR_WEBSITE";
// const CHANNEL_ID = "YOUR_CHANNEL_ID";
// const INDUSTRY_TYPE_ID = "YOUR_INDUSTRY_TYPE_ID";
// const CALLBACK_URL = "YOUR_CALLBACK_URL";

// router.post("/add-wallet-amount", async (req, res) => {
//   const { userId, amount } = req.body;

//   try {
//     const existingUser = await User.findById(userId);
//     if (!existingUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Generate unique order ID
//     const orderId = `ORDER${Date.now()}`;

//     // Create the request data for Paytm
//     const requestData = {
//       MID: MERCHANT_ID,
//       ORDER_ID: orderId,
// CUST_ID: userId,
//       INDUSTRY_TYPE_ID,
//       CHANNEL_ID,
//       TXN_AMOUNT: amount.toString(),
//       WEBSITE,
//       CALLBACK_URL,
//       CHECKSUMHASH: "", // Placeholder for the checksum
//     };

//     // Generate checksum using Paytm merchant key
//     requestData.CHECKSUMHASH = generateChecksum(requestData, MERCHANT_KEY);

//     // Make the payment request to Paytm
//     const response = await axios.post("https://securegw.paytm.in/order/process", requestData);

//     // After successful payment, update the user's wallet amount
//     existingUser.wallet += amount;
//     await existingUser.save();

//     // Redirect the user to the Paytm payment page
//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error adding wallet amount:", error.message);
//     return res.status(500).json({ error: "Error adding wallet amount" });
//   }
// });

// // Generate the checksum using Paytm merchant key
// function generateChecksum(data, key) {
//   const sortedData = Object.keys(data)
//     .sort()
//     .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});

//   const checksumString = Object.keys(sortedData)
//     .map((key) => `${key}=${sortedData[key]}`)
//     .join("&");

//   return crypto.createHmac("sha256", key).update(checksumString).digest("hex");
// }

// module.exports = router;
