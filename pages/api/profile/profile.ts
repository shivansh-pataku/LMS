import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Define PendingUser type
type PendingUser = RowDataPacket & {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact: string | null;
    department: string | null;
    role_id: number;
    profile_image: Buffer | null;
    created_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const userRole = Number(session?.user?.role); // Convert role to number
 

    try {
        let query = "";
        const queryParams: (string | number)[] = [];

            query = `SELECT first_name, last_name, email, contact, department, semester, profile_image, created_at as joined_at FROM users WHERE role_id = ?`; queryParams.push(userRole);


        const [rows]: [PendingUser[], unknown] = await db.query(query, queryParams);

        const usersWithImages = rows.map(user => ({
            ...user,
            profile_image: user.profile_image ? `data:image/jpeg;base64,${user.profile_image.toString("base64")}` : null,
        }));

        return res.status(200).json(usersWithImages);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
