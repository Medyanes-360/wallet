const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // VerificationCode: the code from send-code API endpoint
      // userInput: what they enter into the pop up
      const { verificationCode, userInput } = await req.body;

      if (!verificationCode || !userInput) {
        return res.status(400).json({
          status: "error",
          message: "Both verificationCode and userInput are required.",
        });
      }

      if (verificationCode.trim() === userInput.trim()) {
        return res.status(200).json({
          status: "success",
          isVerified: true,
          message: "Verification code matches."
        });
      }

      return res.status(400).json({
        status: "error",
        isVerified: false,
        message: "Verification code does not match."
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  } else {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
    });
  }
};

export default handle;
