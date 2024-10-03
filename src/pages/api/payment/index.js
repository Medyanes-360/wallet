const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const middlewareResponse = await validatePaymentMiddleware(req);

      // Check if middlewareResponse is an instance of NextResponse
      if (middlewareResponse.status !== 200) {
        const middlewareBody = await middlewareResponse.json();
        return res
          .status(middlewareResponse.status)
          .json({
            status: "error",
            message: `MIDDLEWARE ERROR: ${middlewareBody.message}`,
          });
      }

      // If the middleware passes, proceed with payment logic
      const body = await req.json(); // Use req.json() to parse JSON body in Next.js
      console.log(body);

      return res
        .status(200)
        .json({ status: "success", message: "API request succeeded" });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", error: `API CATCH ERROR: ${error.message}` });
    }
  } else {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }
};

export default handle;
