import { getAllData, getUniqueData } from "../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Get both email and ipAddress, since this API call happens before nextAuth sign-in call
      const { email, ipAddress = "95.91.246.240" } = req.body;

      if (!email || !ipAddress) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email or ip address",
        });
      }

      // check the user data in db
      const user = await getUniqueData("User", { email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // check the ip data in db
      const checkUserIp = await getUniqueData("IPlist", {
        userId: user.id,
        ipAddress,
      });

      const activeIP = await getAllData("IPlist", {
        userId: user.id,
        isActive: true,
      });

      // check if there is already a user in the session via checking ip for isActive
      if (activeIP.length !== 0) {
        return res.status(200).json({
          status: "info",
          isIPActive: true,
          message:
            "There is already a user signed in with this email. If you want to sign in, please enter the code we sent to your email",
        });
      }

      // if the ip is new and is not in the db, we are sending confirmation code to the email of the user
      if (!checkUserIp) {
        return res.status(200).json({
          status: "info",
          isConfirmationRequired: true,
          message:
            "This Ip appears to be new. Please enter the code we sent to your email",
        });
      }

      // if the user ip is blocked, then we are simply showing a pop up and stopping the process
      if (checkUserIp.isBlocked) {
        return res.status(403).json({
          status: "error",
          isIPBlocked: true,
          message:
            "Your IP address has been blocked by the administrators. Please contact them for further assistance.",
        });
      }

      // if everything is okay, this means that the user ip is in the db and there is no active user in the session, so it's free to sign-in
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
