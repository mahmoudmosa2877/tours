const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'jonas schmedtmann <hello@jonas.io>';
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendGrid
      return 1;
    }
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      secureConnection: false,
      port: 587,
      auth: {
        user: 'e8b41f6913e5ed',
        pass: 'c9a10429eca12f'
      },
      connectionTimeout: 5 * 60 * 1000,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      logger: true,
      debug: true
    });
  }
  async send(templet, subject) {
    //send the actual email
    //1) render html based on html templet
    const html = pug.renderFile(`${__dirname}/../views/email/${templet}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //2) define email options
    let mailOptions = {
      from: this.from, // sender address
      to: this.to, // list of receivers
      subject, // Subject line
      html, // html body
      text: htmlToText.fromString(html) // plain text body
    };

    //3) create a transform and send Email
    await this.newTransport().sendMail(mailOptions);
    // await transport.sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to the natours family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'your password reset tokenis valid for 10 min'
    );
  }
};

// const sendEmail = async options => {
//1) create transporter
// var transport = nodemailer.createTransport({
//   host: 'smtp.mailtrap.io',
//   secureConnection: false,
//   port: 587,
//   auth: {
//     user: 'e8b41f6913e5ed',
//     pass: 'c9a10429eca12f'
//   },
//   connectionTimeout: 5 * 60 * 1000,
//   tls: {
//     ciphers: 'SSLv3',
//     rejectUnauthorized: false
//   },
//   logger: true,
//   debug: true
// });
//2) define email options
// let mailOptions = {
//   from: 'jonas schmedtmann <hello@jonas.io>', // sender address
//   to: options.email, // list of receivers
//   subject: options.subject, // Subject line
//   text: options.message // plain text body
//   //html: '<b>Hello world?</b>' // html body
// };
//3)actually send the email
// await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;
