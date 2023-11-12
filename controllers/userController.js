const userModel = require("../model/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Mailsend = require("../helper/mail");
const { mailHtml, forgetMail,change_passMail } = require("../helper/mail_html");
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
          console.log(data,"=============")

          const verificationLink = `${process.env.EmailVerify_link}${data._id}`;
          let bodyData = {email:data.email,name:data.username}
          let emailHtml = mailHtml(
            bodyData,
            verificationLink,
           `<h4> Thank you for registering on Hot Date App! We're excited to have you join our community.</h4>`
          );
        let  mailOptions ={
          from: process.env.Nodemailer_id,
          to: data.email,
          subject: "user verify",
          html: emailHtml,
        }
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
            }
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
          let bodyData = {email:data.email,name:data.username}
          let emailHtml = mailHtml(
            bodyData,
            verificationLink,
           `<h4> Thank you for registering on Hot Date App! We're excited to have you join our community.</h4>`
          );
        let  mailOptions ={
          from: process.env.Nodemailer_id,
          to: data.email,
          subject: "user verify",
          html: emailHtml,
        }
          Mailsend(req, res, mailOptions);
          const token = jwt.sign(
            { _id: exist._id, email: exist.email, role: exist.role },
            SECRET_KEY,
            {
              expiresIn: "30d",
              expiresIn: "30d",
            }
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
            expiresIn: "24h",
          }
        );
        exist.isLogged=true;
        await exist.save();
        const options = {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        };
      
        return res.status(200).cookie("token", token, options).send({ data: exist, token: token });
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  },

async userLoggedIN(req,res){
try{
  const findUser_Status = await userModel.findById(req.user._id);
if(findUser_Status.isLogged){
  return res.status(200).send(findUser_Status)
}else{
  return res.status(403).send({message:"You have to login first!"})
}
}catch(err){
  console.log(err,"NOW")
  return res.status(500).send(err)
}
},
  async upload_image(req, res) {
    const { userId } = req.params;
    console.log(userId);
    try {
      if (!userId) {
        return res.status(400).send("userId is required");
      }
      const exist = await userModel.findOne({ _id: userId });
      console.log(exist)
      if (!exist) {
        return res.status(404).send("User doesn't exist");
      }
      let image = "";
      console.log(req.files)
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
            `${process.env.Backend_URL_Image}${uploadedImage.filename}`
          );
        }
      }
      if (req.files && req.files["videos"]) {
        for (const uploadedvideos of req.files["videos"]) {
          videos.push(
            `${process.env.Backend_URL_Image}${uploadedvideos.filename}`
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
        { new: true }
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
          { new: true }
        );
console.log(data.image);

if(!data.image){
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
          { new: true }
        );
        if (req.body.interests) {
          data.interests = JSON.parse(req.body.interests);
        }
         if(req.body.couple){
          data.couple = JSON.parse(req.body.couple) ;
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
  }, async findOne(req, res) {
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
        { token: null, isLogged:false },{new:true}
      
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
        { new: true }
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
          { new: true }
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
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        let title = "Reset Password"
      let html =  change_passMail(title,data.username," Your password is changed successfully please login with your newly created credentials")
        let mailOptions = {
          from: process.env.Nodemailer_id,
          to: email,
          subject:title ,
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
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        let title = "Change Password"
        let html =  change_passMail(title,data.username," Your password is changed successfully please login with your newly created credentials")
        let mailOptions = {
          from: process.env.Nodemailer_id,
          to: get_pass.email,
          subject:title,
          html:html,
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
      const data = await userModel
        .findById({ _id: id })
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
            "Your email verification link has expired. Please sign up again."
          );
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { isVerify: true },
        { new: true }
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
  }
};
