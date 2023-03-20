import express from "express"
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import router from "./app.route";
import { connect } from "mongoose";
import { applypassport, apllyGoogleStrategy } from "./src/modules/authentication/auth";


dotenv.config();

const app = express();


app.use(session({ secret: "adCreative", resave: false, saveUninitialized: false }));

// Initialize passport middleware
app.use(passport.initialize());


app.use(express.json());



connect(process.env.MONGODB_URL!)
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))




app.use(express.urlencoded({ extended: true }));

applypassport();
apllyGoogleStrategy();

app.use('/api/v1/', router)


const PORT = process.env.SERVER_PORT

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);

})




