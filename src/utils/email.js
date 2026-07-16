import {nodemailer} from "nodemailer";
class Email {
  constructor(url, message, user) {
    this.url = url;
    this.message = message;
    this.from = `Krypton <${process.env.EMAIL_USERNAME}>`;
    this.to = user.email;
this.firstname = user.name?.split(" ")[0] || "User";  }

//TODO get the email api from google v2
  createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
 async  send(subject){
    try{

        await this.createTransport().sendMail({
            from :this.from,
            to:this.to,
            subject:subject,
            text:this.message

        });

        console.log("email sent to ", this.to)
    }catch(err){
        console.log(err);
    }
  }
}

export default Email;
