import { getUniqueData } from "../../../../services/serviceOperations";
import { generateVerificationCode } from "../../../../services/generateVerificationCode";
import sendEmail from "../../../../services/sendEmail";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // we must get the email to send a verificationCode
      const { email } = await req.body;

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email",
        });
      }

      // check the user data in db
      const user = await getUniqueData("User", { email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      const sendEmailVerificationCode = async () => {
        const verificationCode = generateVerificationCode();
        // messageHtml is for nodemailer inside of sendEmail function
        const messageHtml = `<h3>Your verification code is: ${verificationCode}</h3>`;

        await sendEmail(email, "Verification Code", messageHtml);

        return verificationCode;
      };

      const emailResponse = await sendEmailVerificationCode();

      return res.status(200).json({
        status: "success",
        verificationCode: emailResponse,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: "error", message: "Method Not Allowed" });
  }
};

export default handle;
