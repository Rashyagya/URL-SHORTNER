import { Request, Response } from "express";
import usermodel, { User } from "./userModel";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as userService from "./userSevice"
import userModel from "./userModel";


//=================================register=======================================//

export async function signUp(req: Request, res: Response) {
  try {
    let { fullName, email, password, confirmPassword } = req.body
    
    let encryptedPassword = await bcrypt.hash(password, 8)
    password = encryptedPassword;
    
     let data = await userService.registerUser(fullName,email,password)
    return res.status(httpStatus.CREATED)
      .send({ status: true, message: "Successfully", data:data })


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

    // console.log(email,password)
    let user: User | null = await userService.loginUser(email as string,password as string)

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send({ status: false, message: "User not found" });
    } else {
      let comparePassword:boolean = bcrypt.compareSync(password, user.password)

      if (!comparePassword) {
        return res.status(401).send({ status: false, message: "Incorrect Password" });
      }
    }

    const token:string = jwt.sign({ "userId": user._id, },
      "adCreative",
      { expiresIn: "10hr" }
    );

    res.header("Authorization", "Bearer : " + token);

    return res.status(httpStatus.OK).send({
      status: true,
      message: "User logged in successfully", 
      data: {user:user, token:token}
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
    let data = req.body;
    return res.status(httpStatus.OK).send({
      status: true,
      message: "Here is your query !!!!!!", data: data
    });

  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}

//===========================forget password==============================//

export async function forgetPassword(req: Request, res: Response) {
  try {
    let email = req.body.email
    let userData = await userService.finduserByemail(email as string);

    if (userData) {
      let otpcode:number = Math.floor((Math.random() * 10000) + 1);

      let otpData = await userService.updateUser(email ,{
          otp: otpcode,
          expireIn: new Date().getTime() + 300 * 1000    //expaireIn 5mint
        }
        );

      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
          user: "547a2859595ea2",
          pass: "3a8f8dc58528a7"
        }
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
      return res.status(httpStatus.NOT_FOUND)
        .send({ status: false, message: "Email does not exist" })
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
      let { email, otp} = req.body
      let Data = await userService.resetUser(email as string, otp as number);
      if(Data){

        let currentTime:number = new Date().getTime();
        let diff = Data.expireIn - currentTime;
        console.log(diff);

        if(diff < 0){
          return res.status(httpStatus.BAD_REQUEST)
          .send({status:false , message: "otp expire"})
        }else{
        Data.password = req.body.password;
        let encryptedPassword = await bcrypt.hash(Data.password, 8)
        Data.password = encryptedPassword;
        Data.save();
          return res.status(httpStatus.OK)
          .send({status:true , message: "password change successfully"})
        }
      }
      else{
          return res.status(httpStatus.BAD_REQUEST)
          .send({status:false , message: "invalid otp"})
      }
  
    }catch (error) {
      const err: Error = error as Error;
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: err.message });
    }               
  }



//============================change password==============================//

export async function changePassword(req: Request, res: Response) {
  try {
    let { password, newPassword, confirmNewPassword } = req.body;
    let userId = req.user;
 
    let user: User | null = await usermodel.findById((userId),{otp:false,expireIn:false})

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send({ status: false, message: "User not found" });
    } else {
      let comparePassword:boolean = bcrypt.compareSync(password, user.password)

      if (!comparePassword) {
        return res.status(401).send({ status: false, message: "Incorrect Password" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    

    return res.status(httpStatus.OK).send({
      status: true,
      message: "password update successfully", 
      data:user
    });

  } catch (error) {
    const err: Error = error as Error;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
    });
  }
}





