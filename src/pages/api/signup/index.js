import {
  getUniqueData,
  createNewData,
} from "../../../services/serviceOperations";

async function checkEmail(email) {
  const user = await getUniqueData("User", { email });
  console.log(user);
  user === null ? false : user;
}

async function createNewUser(data) {
  const newUser = await createNewData("User", {
    fullName: data.fullname,
    email: data.email,
    password: data.password,
    phoneNumber: data.tel,
    dateOfBirth: new Date(data.birthdate),
  });
  console.log(newUser);

  return newUser;
}

const handle = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;

    if (checkEmail(data.email) === true && checkEmail(data.email) !== null) {
      return res.status(500).json({ msg: "Email already used!" });
    }
    try {
      await createNewUser(data);
    } catch (error) {
      return res.status(404).json({ error: error });
    }

    console.log(data);
    res.status(200).json({ msg: data });
  } else {
    return res.status(404).json({ message: "Not Found" });
  }
};

export default handle;
