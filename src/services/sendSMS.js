import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSMS = async (userPhoneNumber, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: userPhoneNumber,
    });
    return { status: "success", message: "SMS sent successfully" };
  } catch (error) {
    return { status: "failure", message: error.message };
  }
};

export default sendSMS;
