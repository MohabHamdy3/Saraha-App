import { EventEmitter } from "events";
import { generateToken } from "../token/generateToken.js";
import { sendEmail } from "../../service/sendEmail.js";

export const eventEmitter = new EventEmitter();


eventEmitter.on("sendEmail" , async (data) =>{
    const token = await generateToken({payload : { email : data.email}, SIGNATURE: process.env.SIGNATURE ,options: {expiresIn:60 *3}})
    console.log(token)
    const link = `http://localhost:7200/users/confirmEmail/${token}`
    const isSent = await sendEmail({to: process.env.TEST_EMAIL ,subject: "confirm email", html : `<a href = "${link}">confirmed email </a>`})
    if (!isSent){
      throw new Error("failed to send email" , {
        cause : 400,
      })
    }
})


eventEmitter.on("forgetPassword" , async (data) =>{
    const {email , otp} = data
    // send otp confirmation 
    const isSent = await sendEmail({to: process.env.TEST_EMAIL ,subject: "forget password", html : `otp : ${otp}`})
    if (!isSent){
      throw new Error("failed to send email" , {
        cause : 400,
      })
    }
})