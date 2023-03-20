import userModel from "./userModel";



export async function registerUser(fullName: string,email: string,password: string){
    return await userModel.create({ fullName, email, password });

}

export async function loginUser(email: string,password: string){
    return await userModel.findOne({email},{otp:false, expireIn:false})

}

export async function finduserByemail(email:string) {
     return await userModel.findOne({email});
}

export async function updateUser(email:string, updateBody:any){
    return await userModel.findOneAndUpdate({ email:email }, updateBody, { new: true }
    );
}

export async function resetUser(email:string,otp:number) {
    return await userModel.findOne({email, otp});
}

export async function userById(userId:string){
    return await userModel.findById(userId, {otp:false,expireIn:false})
}
