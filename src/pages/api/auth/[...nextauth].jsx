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
import { signIn } from "next-auth/react";

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
        // Attach user details to token
        token.user = { ...user };

        // Get expiration timestamp from the token.
        // Convert it to a JS Date object, multiply it by 1000 (because Date uses milliseconds).
        const expirationDate = new Date(token.exp * 1000); // Convert 'exp' to milliseconds

        // A new token is being created and saved in the database
        await createNewData("Session", {
          userId: user.id,
          sessionToken: token.jti,
          expires: expirationDate,
        });
      }
      return token;
    },

    async session({ session, token }) {
      // Pass the user object to the session
      if (token?.user) {
        session.user = token.user;
      }

      // Find the current session in the database for the logged-in user
      const currentSession = await getUniqueData("Session", {
        userId: token.user.id,
      });

      // If there's an active session and it has a different sessionToken from the current one, invalidate it
      if (currentSession && currentSession.sessionToken !== token.jti) {
        // Invalidate the previous session by deleting it
        await deleteDataByAny("Session", {
          sessionToken: currentSession.sessionToken,
        });
      }

      // Continue with the current session
      return session;
    },

    async signIn({ user }) {
      // Find an existing active session for the user
      const existingSession = await getUniqueData("Session", {
        userId: user.id,
      });

      if (existingSession) {
        // If an existing session is found, delete it to invalidate the old session
        await deleteDataByAny("Session", {
          sessionToken: existingSession.sessionToken,
        });
      }

      return true;
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
