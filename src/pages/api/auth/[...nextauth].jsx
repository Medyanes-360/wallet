import nextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DecryptPassword from "../../../lib/decryptPassword";
import {
  createNewData,
  deleteDataByAny,
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
            // if it is a new ip then add it to db
            await createNewData("IPlist", {
              userId: findUser.id,
              ipAddress,
              isActive: true,
            });
          } else {
            // if no, and the user could sign in, then it means they are in the session, so, turn isActive true to know that there is a user in the session
            await updateDataByAny("IPlist", {
              userId: findUser.id,
              ipAddress,
              isActive: true,
            });
          }

          // compare the user input password and db password
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

    async session({ session, token, user }) {
      if (token?.user) {
        session.user = token.user;
      }

      // Find the current session in the database for the logged-in user
      const currentSession = await getUniqueData("Session", {
        userId: user.id,
      });

      // If there's an active session and it has a different sessionToken from the current one, invalidate it
      if (currentSession && currentSession.sessionToken !== token.jti) {
        // Delete the previous session, allowing only one active session
        await deleteDataByAny("Session", {
          sessionToken: currentSession.sessionToken,
        });
      }

      // Continue with the current session
      return session;
    },

    async signOut({ token }) {
      // After signin out, turn isActive of IP to false as the user signing out because we check whether there is active user using IPs
      await updateDataByAny(
        "IPlist",
        { userId: token.user.id },
        { isActive: false }
      );
      return true; // Allow sign out
    },
  },
};

export default nextAuth(authOptions);
