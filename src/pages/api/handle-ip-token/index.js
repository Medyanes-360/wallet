import { createNewData } from "../../../services/serviceOperations";
import { verifyJwtToken } from "../../../services/verifyJwtToken";

const handle = async (req, res) => {
  if (req.method === "GET") {
    try {
      // Get both token and action
      const { token, action } = req.query;

      // Verify the token
      const payload = verifyJwtToken(token);
      if (!payload) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired token.",
        });
      }

      // Check if the user confirmed or refused
      if (action === "confirm") {
        await createNewData("IPlist", {
          userId: payload.userId,
          ipAddress: payload.ipAddress,
        });
        return res.status(200).json({
          status: "success",
          message: "IP confirmed successfully.",
        });
      } else if (action === "refuse") {
        return res.status(200).json({
          status: "info",
          message: "IP confirmation was declined.",
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid confirmation status.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error,
      });
    }
  } else {
    return res.status(405).json({
      status: "error",
      message: "Method not Allowed",
    });
  }
};

export default handle;



// nextauth sign-in endpointi icin jwt token

          // JWT token if needed===========================
          
          // const myAPI = "95.91.246.200";

          // check whether isBlocked in ipList is true or false
          // const checkUserIp = await getUniqueData("IPlist", {
          //   userId: findUser.id,
          //   ipAddress: myAPI,
          // });

          // if (!checkUserIp) {
          //   const token = generateJwtToken({
          //     userId: findUser.id,
          //     ipAddress: myAPI,
          //   });

          //   // Create the confirmation and decline base links
          //   const confirmationBaseLink = `${process.env.NEXT_PUBLIC_URL}/api/handle-ip?token=${token} action=confirm`;
          //   const declineBaseLink = `${process.env.NEXT_PUBLIC_URL}/api/handle-ip?token=${token} action=refuse`;
            
          //   //! LINKS MUST BE HASHED OR THEY CAN BE USED BY OTHERS!!!

          //   // Send confirmation email
          //   const emailMessage = `
          //               <h1>Hello!</h1>
          //               <p>A new IP (${ipAddress}) is trying to access your account.</p>
          //               <a href="${confirmationBaseLink}">Confirm IP</a>
          //               <br />
          //               <a href="${declineBaseLink}">Decline IP</a>
          //               `;
          //   await sendEmail(
          //     findUser.email,
          //     "IP Confirmation Required",
          //     emailMessage
          //   );

          //   return {
          //     message: "IP confirmation required. Please check your email.",
          //   };
          // }

          // if (checkUserIp.isBlocked) {
          //   throw new Error("Invalid IP address");
          // }

          // JWT token if needed===========================