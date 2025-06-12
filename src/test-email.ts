// test-email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'harshajyosyabhatla@gmail.com',
    pass: 'ezrv djfl alre ygbg', // Replace with new app-specific password
  },
  logger: true,
  debug: true,
});

async function testEmail() {
  try {
    await transporter.verify();
    console.log('SMTP Server connection successful');

    await transporter.sendMail({
      from: '"Test" <harshajyosyabhatla@gmail.com>',
      to: 'test@example.com', // Replace with a valid test email
      subject: 'Test Email',
      text: 'This is a test email from Nodemailer.',
      html: '<p>This is a test email from Nodemailer.</p>',
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail();