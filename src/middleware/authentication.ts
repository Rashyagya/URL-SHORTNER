import passport from "passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Strategy as googleAuth } from "passport-google-oauth20";
import userModel from "../model/userModel";
import { Request, Response } from "express";

// ===========================passportJWT============================//

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "adCreative"
}

export function applypassport() {

    passport.use(new Strategy(options, async function (jwt_payload, done) {

        // console.log(jwt_payload)
        // res.set({ id: jwt_payload._id })

        try {
            const user = await userModel.findOne({ id: jwt_payload._id })
            if (user) {
                return done(null, user)
            }
        } catch (error) {
            return error;
        }
    }));
}

//==================================passport google auth================//

export function apllyGoogleStrategy() {

    passport.use(new googleAuth({
        clientID: "618969192158-bo39ci2nste0i4kqpkr49et8kd82vcbd.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:3000"
    }, 
    function ( accestoken, refreshtoken, profile, done) {
        done(null, profile)
    }))

    passport.serializeUser(function (user, done) {
        done(null, user)
    })


    passport.deserializeUser(function (user: string, done) {
        done(null, user)
    })
}




