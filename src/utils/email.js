import nodemailer from "nodemailer";
class Email {

  constructor( message, user) {
    this.message = message;
this.from = `"Project Management App" <${process.env.EMAIL_USERNAME}>`;
    this.to = user.email;
this.firstname = user.name?.split(" ")[0] || "User";  }

  createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
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
            throw err;
    }
  }
}

export default Email;
