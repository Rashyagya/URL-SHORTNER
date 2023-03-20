import { Schema, model, Document } from "mongoose";

export interface User extends Document {
    fullName: string;
    email: string;
    password: string;
    otp: string;
    expireIn: number;
    id: string;
}

const userSchema: Schema = new Schema<User>({
    fullName: {
        type: String,
    },
    email: {
        type: String,
        unique:true
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
    },
    expireIn: {
        type: Number,
    },
}
,{  
    toJSON: {                     //for removing _id & __v from postman response
        transform: function (doc, ret) {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        }
      },
});

export default model<User>("user", userSchema);


