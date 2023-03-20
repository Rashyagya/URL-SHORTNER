import { Request, Response } from "express";
import usermodel, { User } from "../model/userModel";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as service from "../services/sevice";
import axios from "axios";

//=================================register=======================================//

export async function signUp(req: Request, res: Response) {
  try {
    let { fullName, email, password, confirmPassword } = req.body;

    let encryptedPassword = await bcrypt.hash(password, 8);
    password = encryptedPassword;

    let data = await service.registerUser(fullName, email, password);
    return res
      .status(httpStatus.CREATED)
      .send({ status: true, message: "Successfully", data: data });
  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}

//===============================login ========================================//

export async function login(req: Request, res: Response) {
  try {
    let { email, password } = req.body;

    let user: User | null = await usermodel.findOne({ email: email });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ status: false, message: "User not found" });
    } else {
      let comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) {
        return res
          .status(401)
          .send({ status: false, message: "Incorrect Password" });
      }
    }

    const token = jwt.sign({ userId: user._id }, "adCreative", {
      expiresIn: "10hr",
    });

    res.header("Authorization", "Bearer : " + token);

    return res.status(httpStatus.OK).send({
      status: true,
      message: "User logged in successfully",
      data: { userId: user, token: token },
    });
  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}

// ==========================get api============================//

export async function fetchDetails(req: Request, res: Response) {
  try {
    const { url } = req.body;
    const data = await axios.post(
      `https://3cca-2405-201-300b-e0f2-d19d-518f-c671-d8ce.in.ngrok.io`,
      {
        url: url,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.status(httpStatus.OK).send({
      status: true,
      message: "description generated successfully",
      data: data.data,
    });
  } catch (error) {
    console.log(error);
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}

//===========================forget password==============================//

export async function forgetPassword(req: Request, res: Response) {
  try {
    let userData = await usermodel.findOne({ email: req.body.email });

    if (userData) {
      let otpcode = Math.floor(Math.random() * 10000 + 1);

      let otpData = await usermodel.findOneAndUpdate(
        { email: userData.email },
        {
          otp: otpcode,
          expireIn: new Date().getTime() + 300 * 1000, //expaireIn 5mint
        },
        { new: true }
      );

      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
          user: "547a2859595ea2",
          pass: "3a8f8dc58528a7",
        },
      });

      // Define the email message
      const message = {
        from: "547a2859595ea2",
        to: "0f733fce17-a93b78+1@inbox.mailtrap.io",
        subject: "Reset Your Password",
        text: "reset your password " + otpcode,
        // Please click the following link to reset your password: http://localhost:4000/api/v1/resetpassword",
      };

      // Send the email using Nodemailer
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Failed to send password reset email");
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).send("Password reset email sent");
        }
      });
    } else {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ status: false, message: "Email does not exist" });
    }
  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}

//=============================reset password================================//

export async function resetPassword(req: Request, res: Response) {
  try {
    let Data = await usermodel.findOne({
      email: req.body.email,
      otp: req.body.otp,
    });
    if (Data) {
      let currentTime = new Date().getTime();
      let diff = Data.expireIn - currentTime;
      console.log(diff);

      if (diff < 0) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({ status: false, message: "otp expire" });
      } else {
        Data.password = req.body.password;
        let encryptedPassword = await bcrypt.hash(Data.password, 8);
        Data.password = encryptedPassword;
        Data.save();
        return res
          .status(httpStatus.OK)
          .send({ status: true, message: "password change successfully" });
      }
    } else {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ status: false, message: "invalid otp" });
    }
  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
}

//============================change password==============================//

// export async function changePassword(req: Request, res: Response) {
//   try {
//     let { password, newPassword, confirmNewPassword } = req.body;

//     const _id = res.get("_id");
//     // console.log(_id)

//     let encryptedPassword = await bcrypt.hash(newPassword, 10)
//     newPassword = encryptedPassword;

//     const userData = await usermodel
//     .findByIdAndUpdate({_id:_id},{password: newPassword},{new:true})

//     return res.status(httpStatus.OK)
//       .send({ status: true, message: "password Updated successfully", data: userData })

//   } catch (error) {
//     const err: Error = error as Error;
//     res.status(httpStatus.INTERNAL_SERVER_ERROR)
//       .send({ message: err.message });
//   }};
