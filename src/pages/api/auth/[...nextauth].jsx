import nextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../prisma";
import DecryptPassword from "../../../lib/decryptPassword";

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
          const { email, password } = credentials;

          if (!email || !password) {
            throw new Error("Please enter your email and password");
          }

          const findUser = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!findUser) {
            throw new Error("Invalid email or password");
          }

          const passwordDecrypt = await DecryptPassword(
            password,
            findUser.password
          );

          if (!passwordDecrypt) {
            throw new Error("Invalid email or password");
          }

          return findUser;
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
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
  },
};

export default nextAuth(authOptions);
