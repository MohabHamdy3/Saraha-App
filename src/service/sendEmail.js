import nodemailer from "nodemailer"

export const sendEmail = async ({to , subject , html, attachments}) => {
    


// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  port: 587,
  secure: true,
  service : "gmail",
  auth: {
    user:process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

  const info = await transporter.sendMail({
    from: `"Hello .. Mohab " <${process.env.AUTH_EMAIL}>`,
    to: to || process.env.TEST_EMAIL,
    subject: subject || "Hello ✔",
    text: "Hello world?",
    html: html || "<b>Hello world?</b>", 
    attachments : attachments || []
  });

  if(info.accepted.length > 0){
    return true 
  }
  else {
    return false
  }

}