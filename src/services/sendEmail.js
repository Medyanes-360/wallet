import nodemailer from "nodemailer";

// ! THE EMAIL CANNOT BE SENT. IT MIGHT BE BECAUSE OF EMAILS (SENDER/RECEIVER) HAVING SECURITY ISSUES

const sendEmail = async (userEmail, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject,
    html: message,
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
