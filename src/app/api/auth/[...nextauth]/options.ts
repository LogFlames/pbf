import { eq } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            username: {
                label: "Username:",
                type: "text",
            },
            password: {
                label: "Password:",
                type: "password",
            },
        },
        async authorize(credentials, req) {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          let user = await db.query.users.findFirst({
            where: eq(users.username, credentials.username),
          });

          if (user && credentials.username === user.username && credentials.password === user.password) {
            return { id: user.id, username: user.username, firstname: user.firstname, lastname: user.lastname };
          }

          return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          firstname: token.firstname,
          lastname: token.lastname,
        }
      }
    },
  },
};