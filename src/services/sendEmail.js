import nodemailer from "nodemailer";

const sendEmail = async (userEmail, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail is used as the email service
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER, // Sender email address (configured in environment variable)
      pass: process.env.EMAIL_PASS, // App password
    },
  });

   // Define the mail options including the sender, recipient, subject, and message body
  const mailOptions = {
    from: process.env.NEXT_PUBLIC_EMAIL_USER, // Sender email address
    to: userEmail,  // Recipient email address 
    subject, // Email subject
    html: message, // HTML content of the email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.log("Error sending email:", error.message);
    throw new Error("Email not sent");
  }
};

export default sendEmail;
