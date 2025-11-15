var _a;
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginOrgFn, defloginOrgFn } from "@/app/login/actions";
const isProd = process.env.NODE_ENV === "production";
export const { handlers, signIn, signOut, auth } = NextAuth({
    //trustHost: true,
    trustedHosts: (_a = process.env.AUTH_TRUST_HOSTS) === null || _a === void 0 ? void 0 : _a.split(","),
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
                let user = null;
                // fetch user from backend API.
                if ((credentials === null || credentials === void 0 ? void 0 : credentials.access_code) && (credentials === null || credentials === void 0 ? void 0 : credentials.access_username)) {
                    user = await defloginOrgFn(credentials);
                    // return user object with their profile data
                    return user;
                }
                else {
                    user = await loginOrgFn(credentials);
                    // return user object with their profile data
                    return user;
                }
                if (!user) {
                    // No user is found.
                    throw new Error("Invalid credentials.");
                }
            },
        })],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token === null || token === void 0 ? void 0 : token.user) {
                session.user = token.user;
                session.user.token = token.token;
            }
            return session;
        },
        async redirect({ baseUrl, token }) {
            var _a;
            const orgId = (_a = token === null || token === void 0 ? void 0 : token.user) === null || _a === void 0 ? void 0 : _a.organization_id;
            if (orgId) {
                return `${baseUrl}/organizations/${orgId}`;
            }
            return baseUrl;
        },
    }
});
