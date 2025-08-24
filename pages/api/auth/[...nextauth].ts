import NextAuth, { NextAuthOptions } from "next-auth"; // NextAuth is a library for authentication in Next.js applications. It provides a way to manage user sessions and authentication flows. Solutions NextAuth provides include OAuth, email/password authentication, and JWT-based authentication. It also supports various databases for session storage and user management.
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";
import db from "@/utils/db";
import { Role } from "@/types";

// Define ApprovedUser type : Defines the structure of the user object expected from the DB; matches the structure of a user record returned from the MySQL database
type ApprovedUser = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: Role;
    department: string;
    semester: number;
    created_at: string;
};

// Extend NextAuth types for session & user role
// customizing the default session or user data/objects returned by NextAuth
// extending it to include extra fields like role, first_name, semester, etc., so frontend can access them

declare module "next-auth" {
    interface Session {
            user: {
                    name: any;
                    id: string;
                    role: Role;
                    first_name: string;
                    last_name: string;
                    email?: string;
                    department?: string;
                    semester: number;
                    };
                       }

    interface User {
                    role: Role;
                    department: string;
                    first_name: string;
                    last_name: string;
                    semester: number;
                    }
}




export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                try {
                    // Fetch user from MySQL (Include `semester`)
                    const [rows]: [RowDataPacket[], unknown] = await db.query(
                         `SELECT id, first_name, last_name, email, password, role_id AS role, department, semester, created_at FROM users WHERE email = ?`,
                        [credentials.email]
                        //Uses ? and [credentials.email] to safely pass in the user's email thus prevents SQL injection.
                    );

                    if (rows.length === 0) throw new Error("No user found!");

                    const user = rows[0] as ApprovedUser; //Typecasts the returned USER DATA row into custom ApprovedUser type
                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    //credentials.password IS The password the user just entered in the form.
                    if (!isValidPassword) throw new Error("Invalid password!");

                    return { 
                        id: user.id.toString(), 
                        first_name: user.first_name,
                        last_name: user.last_name,
                        name: `${user.first_name} ${user.last_name}`, 
                        email: user.email, 
                        role: user.role,
                        department: user.department,
                        semester: user.semester, 
                    };
                } catch (error) {
                    console.error("Authentication Error:", error);
                    throw new Error("Invalid email or password");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) { 
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.email = user.email;
                token.department = user.department;
                token.first_name = user.first_name;
                token.last_name = user.last_name;
                token.semester = user.semester;

                //token: This is the JWT token object used to store data like ID, email, etc.

                //user: This is only available during login — it holds user data returned from the authorize() function.
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id as string,
                role: token.role as Role || "student",
                email: token.email || "",
                department: token.department as string || "",
                first_name: token.first_name as string || "",
                last_name: token.last_name as string || "",
                semester: token.semester as number || 1, // Default to 1
            };
            
            // console.log("Generated Session:", session); // Log session in the terminal
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET, 
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
};

export default NextAuth(authOptions);