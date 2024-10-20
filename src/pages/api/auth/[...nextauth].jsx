import nextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DecryptPassword from "../../../lib/decryptPassword";
import {
  createNewData,
  getAllData,
  getUniqueData,
  updateDataByAny,
} from "../../../services/serviceOperations";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const { email, password, ipAddress } = credentials;

          if (!email || !password) {
            throw new Error("Please enter your email and password");
          }

          const findUser = await getUniqueData("User", { email });

          if (!findUser) {
            throw new Error("Invalid email or password");
          }

          // if the new ip was allowed to be added, it can be here

          const checkUserIp = await getUniqueData("IPlist", {
            userId: findUser.id,
            ipAddress,
          });

          if (!checkUserIp) {
            await createNewData("IPlist", {
              userId: findUser.id,
              ipAddress,
              isActive: true,
            });
          } else {
            await updateDataByAny("IPlist", {
              userId: findUser.id,
              ipAddress,
              isActive: true,
            });
          }

          // const passwordDecrypt = await DecryptPassword(
          //   password,
          //   findUser.password
          // );

          // if (!passwordDecrypt) {
          //   throw new Error("Invalid email or password");
          // }

          return findUser;
        } catch (error) {
          throw new Error(
            `ERROR HEHEHE: ${error.message}` || "Authentication failed"
          );
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    encryption: true,
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = { ...user };
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },

    // async signIn({ user }) {
    //   const findUser = await getUniqueData("User", { email: user.email });
    //   if (findUser.activeSession) {
    //     const verificationCode = generateVerificationCode();

    //     // Send the verification code to the user's email
    //     await sendEmail(
    //       findUser.email,
    //       "Ofistik: Your Verification Code",
    //       `Your code is: ${verificationCode}`
    //     );

    //     const verificationOfSmsCode = await postAPI("/sms/verify-code", {
    //       verificationCode: sendSMSCode,
    //       userInput: smsResult.value,
    //     })
    //       .then((res) => {
    //         if (res.status === 200 || res.status === "success") {
    //           console.log(res.message);
    //           // need to signout the user
    //         } else {
    //           console.log(res.message);
    //           return false;
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(error.message);
    //         return false;
    //       });

    //     return {
    //       error: "User is already signed in on another device.",
    //     };
    //   }

    //   await updateDataByAny(
    //     "User",
    //     { id: findUser.id },
    //     { activeSession: true }
    //   );

    //   return true;
    // },

    async signOut({ token }) {
      // Cleanup: Reset activeSession when the user signs out
      await updateDataByAny(
        "User",
        { id: token.user.id },
        { activeSession: false }
      );
      return true; // Allow sign out
    },
  },
};

export default nextAuth(authOptions);
