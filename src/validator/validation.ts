import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import joi from "joi";

//====================validation for req.body===========================//

export const validator = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    return next();
}


//==========================validation for registration feild=============================//

export const signUpSchema = joi.object({
    fullName: joi.string().min(2).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(36).required(),
    confirmPassword: joi.string().required().valid(joi.ref('password'))
});

//==================================validation for login feild============================//

export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(36).required()
});

//==================================validation for changePassword============================//

export const changePWSchema = joi.object({
    password: joi.string().min(8).max(36).required() ,
    newPassword: joi.string().min(8).max(36).required(),
    confirmNewPassword: joi.string().required().valid(joi.ref('newPassword'))
    
});



