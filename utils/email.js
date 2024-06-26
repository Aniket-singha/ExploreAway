// const { htmlToText } = require('html-to-text');
const nodemailer=require('nodemailer');
const pug=require('pug')
const htmlToText=require('html-to-text')


module.exports=class Email {
  constructor(user,url){
    this.to=user.email,
    this.firstName=user.name.split(' ')[0];
    this.url=url;
    this.from=`Aniket Singh <${process.env.EMAIL_FROM}>`;
  }
  newTransport(){
  if(process.env.NODE_ENV==='production'){
    return 1;
  }
    return  nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    service:'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  }
 async send(template,subject){
      // render html based on a pug template
    const html= pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
      firstName:this.firstName,
      url:this.url,
      subject
    })
      //define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject:subject,
        html:html,
        text:htmlToText.fromString(html)
        // html:
      };
    //create transport and send email
  
    await this.newTransport().sendMail(mailOptions);

  }
 async sendWelcome(){
  //we marked await here cux we want this send function to only return when the email has been sent
    await this.send('welcome','Welcome to the natours family !')
  }

  async sendPasswordReset(){
    await this.send('passwordReset','Your password reset token is valid only for 10 minutes')
  }

}

// const sendEmail = async options => {
//   // 1) Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //   }
//   // });

//   // 2) Define the email options
//   // const mailOptions = {
//   //   from: 'Jonas Schmedtmann <hello@jonas.io>',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message
//   //   // html:
//   // };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// // module.exports = sendEmail;
