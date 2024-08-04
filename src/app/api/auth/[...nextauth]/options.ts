import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const options: NextAuthOptions = {
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
            const user = { id: "42", name: "Elias", password: "elias" };

            if (credentials?.username === user.name && credentials?.password === user.password) {
                return user;
            }

            return null;
        },
    }),
  ],
  session: {
    strategy: "jwt",
  },
};