import { getAllData, getUniqueData } from "../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Get both token and action
      const { email, ipAddress } = req.body;

      // if (!email || !ipAddress) {
      //   return res.status(400).json({
      //     status: "error",
      //     message: "Invalid email or ip address",
      //   });
      // }

      // check the user data in db
      const user = await getUniqueData("User", { email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      const checkUserIp = await getUniqueData("IPlist", {
        userId: user.id,
        ipAddress,
      });

      // check if there is already a user in the session
      const activeIP = await getAllData("IPlist", {
        userId: user.id,
        isActive: true,
      });

      if (activeIP.length !== 0) {
        return res.status(200).json({
          status: "info",
          isIPActive: true,
          message:
            "There is already a user signed in with this email. If you want to sign in, please enter the code we sent to your email",
        });
      }

      // If an active IP exists, skip the rest. Otherwise, send an email confirmation. If correct, proceed to sign-in and add the new IP to the list. However, if there is already a user in the session, we don't add the ip and make sure that the session is free then we would be able to add a new ip to the list
      if (!checkUserIp) {
        return res.status(200).json({
          status: "info",
          isConfirmationRequired: true,
          message:
            "This Ip appears to be new. Please enter the code we sent to your email",
        });
      }

      if (checkUserIp.isBlocked) {
        return res.status(403).json({
          status: "error",
          isIPBlocked: true,
          message:
            "Your IP address has been blocked by the administrators. Please contact them for further assistance.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Everything is good so far",
      });
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
