import userModel from "../model/userModel";



export async function registerUser(fullName: any,email: any,password: any){
    return await userModel.create({ fullName, email, password });

}

// export async function loginUser(email: any,password: any){
//     return await userModel.findOne({ email, password });

// }
