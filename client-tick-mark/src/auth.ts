import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { loginUserFn, loginOrgFn, defloginOrgFn} from "@/app/login/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
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

    providers: [Credentials({
        id: "credentials",
        name: "credentials",
        // Fields that should be submitted.
        credentials: {
            org_email: {
                label: "email",
                type: "text",
                placeholder: "Email",
            },
            org_pwd: {
                label: "password",
                type: "text",
                placeholder: "*******"
            },
            access_username: {
                label: "access_username",
                type: "text",
                placeholder: "Access Username",
            },
            access_code: {
                label: "access_code",
                type: "password",
                placeholder: "******",
            },
        },
        authorize: async (credentials) => {
            let user = null

            // fetch user from backend API.
            if (credentials?.access_code && credentials?.access_username) {
                user = await defloginOrgFn(credentials);
                // return user object with their profile data
                return user
            } else {
                user = await loginOrgFn(credentials);
                // return user object with their profile data
                return user
            }
            if (!user) {
                // No user is found.
                throw new Error("Invalid credentials.")
            }
        },
    })],

    callbacks: {
        authorized: async ({auth}) => {
            //Logged in users are authenticated, otherwise redirect to login page.
            return !!auth
        },
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.token;
                token.user = {...user.user}
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.token = token.accessToken
                session.user = token.user
            }
            return session;
        },

        async redirect({ baseUrl, token }) {
            if (token?.id) {
                return `${baseUrl}/organizations/${token.id}`;
            }
            return baseUrl;
        },
    }
});
