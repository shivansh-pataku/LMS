import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        
        console.log("Full Session from NextAuth:", session); // Log full session

        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json({
            department: session.user.department,
            email: session.user.email,
            role: session.user.role,
            first_name: session.user.first_name,
            last_name: session.user.last_name,
            semester: session.user.semester // Log if it's undefined
        });

    } catch (error) {
        console.error("Error fetching session:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
