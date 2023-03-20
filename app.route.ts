import express from "express";
const router = express.Router();
import * as user from "./src/modules/authentication/userController";
import { validator, loginSchema, signUpSchema,changePWSchema } from "./src/validator/validation";
import passport from "passport";

//============POST api==============//
router.post("/signup", validator(signUpSchema), user.signUp)

router.post("/login", validator(loginSchema), user.login)

router.get("/fetchDetails", 
       passport.authenticate("jwt", { session: false }), user.fetchDetails)

router.post("/forgetpassword", user.forgetPassword )  

router.post("/resetpassword" , user.resetPassword )

router.post("/changepassword",
passport.authenticate("jwt", { session: false }), validator(changePWSchema), user.changePassword)

//===========login with google api==========//

router.get(
  "/",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/googlelogin",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/fail",
  })
);

router.get("/auth/fail", (req, res) => {
  res.send("user login failed");
});

router.get("/logout", (req, res) => {
  req.logout((err) => console.log(err));
  console.log(req.isAuthenticated());

  res.send("user logged out");
});

export default router;
