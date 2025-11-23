import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginUserFn, loginOrgFn, defloginOrgFn } from "@/app/login/actions";

const isProd = process.env.NODE_ENV === "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustedHosts: process.env.AUTH_TRUST_HOSTS?.split(","),
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  jwt: {
    secret: process.env.AUTH_JWT_SECRET,
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
  },

  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        org_email: { label: "email", type: "text", placeholder: "Email" },
        org_pwd: { label: "password", type: "text", placeholder: "*******" },
        access_username: { label: "access_username", type: "text", placeholder: "Access Username" },
        access_code: { label: "access_code", type: "password", placeholder: "******" },
      },

      authorize: async (credentials) => {
        try {
          let user;

          if (credentials?.access_code && credentials?.access_username) {
            // Login using access code & username
            user = await defloginOrgFn(credentials);
          } else {
            // Regular organization login
            user = await loginOrgFn(credentials);
          }

          if (!user || !user.token) {
            throw new Error("Invalid credentials.");
          }

          return user;
        } catch (err) {
          throw new Error("Invalid Credentials.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.token = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
        session.user.token = token.token;
      }
      return session;
    },

    async redirect({ baseUrl, token }) {
      const orgId = token?.user?.organization_id;
      if (orgId) {
        return `${baseUrl}/organizations/${orgId}`;
      }
      return baseUrl;
    },
  },
});

