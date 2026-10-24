import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const normalizedEmail = credentials.email.trim().toLowerCase();

                // Built-in ADMIN login support (admin@mygenie.com / admin123 or admin@example.com / password123)
                if (
                    (normalizedEmail === "admin@mygenie.com" || normalizedEmail === "admin@example.com" || normalizedEmail === "admin") &&
                    (credentials.password === "admin123" || credentials.password === "password123" || credentials.password === "admin")
                ) {
                    const targetEmail = normalizedEmail === "admin" ? "admin@mygenie.com" : normalizedEmail;
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const adminUser = await prisma.user.upsert({
                        where: { email: targetEmail },
                        update: { role: "ADMIN" as UserRole },
                        create: {
                            email: targetEmail,
                            name: "MyGenie Super Admin",
                            password: hashedPassword,
                            role: "ADMIN" as UserRole,
                            verified: true,
                        },
                    });

                    return {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name || "MyGenie Super Admin",
                        role: "ADMIN",
                        image: adminUser.image,
                    };
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            }
        })
    ],

    session: {
        strategy: "jwt"
    },

    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
