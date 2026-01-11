const nodemailer = require('nodemailer'); // Ensure nodemailer is installed

// Load environment variables
const EMAIL_USER = process.env.EMAIL_USER; // Your Zoho email address
const EMAIL_PASS = process.env.EMAIL_PASS; // Zoho app password
const CLIENT_URL = process.env.CLIENT_URL || 'https://yatramaker.com';


// Create a transporter using Zoho SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // Zoho SMTP host
  port: 465, // SMTP port for SSL
  secure: true, // Use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, 
  },
});

const sendRegistrationNotification = (to, userName) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: `Welcome to YatraMaker, ${userName}! Your Budget-Friendly Adventure Awaits`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to YatraMaker</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <img src="https://yatramaker.com/assets/logos/Yatra_Maker_Logo.png" alt="YatraMaker Logo" style="max-width: 200px;">
        </header>
        
        <main>
          <h1 style="color: #1a73e8;">Congratulations, ${userName}!</h1>
          
          <p>Welcome to YatraMaker - where your dream trips meet your budget. We're thrilled to have you join our community of savvy travelers!</p>

          <p>At YatraMaker, we believe everyone deserves amazing travel experiences, regardless of their budget. That's why we've created a platform that helps you discover incredible destinations and experiences tailored to your specific budget.</p>

          <p>Here's how YatraMaker works:</p>
          
          <ol style="background-color: #f0f8ff; padding: 20px; border-radius: 10px;">
            <li><strong>Set Your Budget</strong>: Tell us how much you want to spend.</li>
            <li><strong>Share Your Preferences</strong>: Let us know your current location and any travel preferences.</li>
            <li><strong>Discover Destinations</strong>: We’ll show you exciting places within your budget.</li>
            <li><strong>Explore Itineraries</strong>: Check out detailed plans with cost breakdowns.</li>
            <li><strong>Book Your Trip</strong>: Found your ideal trip? We’ll help you book it!</li>
          </ol>
          
          <p style="font-style: italic; color: #666;">Pro tip: Our prices are close estimates. When you book, we'll confirm the exact cost based on your travel dates to ensure the best value for your budget.</p>
          
          <p>Thousands of travelers have already discovered hidden gems and created unforgettable memories with YatraMaker. You're just a few clicks away from your next adventure!</p>
          
          <a href="${CLIENT_URL}" style="display: inline-block; background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Start Your Budget-Friendly Adventure</a>
        </main>
        
        <footer style="margin-top: 40px; text-align: center; font-size: 0.9em; color: #666;">
          <p>Questions? Our <a href="mailto:support@yatramaker.com" style="color: #1a73e8; text-decoration: none;">support team</a> is here to help!</p>
          <p>Happy travels,<br>The YatraMaker Team</p>
        </footer>
      </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      // console.log('Registration email sent:', info.response);
    }
  });
};


// Function to send a notification to the admin about new user registration
const sendAdminNotification = (adminEmail, userName, userEmail) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: adminEmail,
    subject: 'New User Registration',
    text: `A new user has registered:\n\nName: ${userName}\nEmail: ${userEmail}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending admin notification:', error);
    } else {
      // console.log('Admin notification sent:', info.response);
    }
  });
};

// Function to send a password reset email to the user
const sendPasswordResetEmail = (to, token) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Password Reset Request',
    text: `Please click on the following link to reset your password: ${CLIENT_URL}/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending password reset email:', error);
    } else {
      // console.log('Password reset email sent:', info.response);
    }
  });
};

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    // console.log('Server is ready to take messages:', success);
  }
});


module.exports = { sendRegistrationNotification, sendAdminNotification, sendPasswordResetEmail };
