import nodemailer from 'nodemailer';

// Configure nodemailer for Gmail
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'magarsamir243@gmail.com', // Change this to your Gmail address
    pass: 'tqvoysjqkburfejy' // Add your app password here (not your regular Gmail password)
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (userEmail, username) => {
  try {
    const mailOptions = {
      from: '"HamroJob Team" <noreply@hamrojob.com>',
      to: userEmail,
      subject: '🎉 Welcome to HamroJob! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #007bff;">Welcome to HamroJob! 🚀</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Hello ${username || 'there'},</p>
            <p>Thank you for joining HamroJob! 🙌 We're excited to have you as part of our community.</p>
            <p>With HamroJob, you can:</p>
            <ul>
              <li>✅ Find your dream job in Nepal</li>
              <li>✅ Connect with top employers</li>
              <li>✅ Build your professional profile</li>
              <li>✅ Track your job applications</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold;">Ready to get started?</p>
            <p style="margin-top: 10px;">Complete your profile to increase your chances of getting noticed by employers!</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="/profile" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Profile</a>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>If you have any questions, feel free to contact our support team at support@hamrojob.com</p>
            <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export { emailTransporter, sendWelcomeEmail };