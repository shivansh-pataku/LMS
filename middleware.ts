import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { Role } from "@/types";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const rolePaths: Record<number, string> = {
        4: "/dashboard/master-admin",
        3: "/dashboard/admin",
        2: "/dashboard/teacher",
        1: "/dashboard/student",
    };

    // Allow public access to these routes
    const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "user"];
    if (publicPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = token.role as number; // Ensure role is treated as a number

    // Redirect /dashboard to the appropriate role-based dashboard
    if (req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL(rolePaths[userRole] || "/login", req.url));
    }

    // Prevent unauthorized users from accessing dashboards they are not assigned to
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
        const allowedPath = rolePaths[userRole];
        if (!allowedPath || !req.nextUrl.pathname.startsWith(allowedPath)) {
            return NextResponse.redirect(new URL(allowedPath || "/login", req.url));
        }
    }

    return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
    matcher: ["/dashboard/:path*"],
};
