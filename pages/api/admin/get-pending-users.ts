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

    if (!session || (userRole !== 3 && userRole !== 4)) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    try {
        let query = "";
        const queryParams: (string | number)[] = [];

        if (userRole === 3) { // Admin Role
            query = `
                SELECT pending_users.id, pending_users.first_name, pending_users.last_name, 
                       pending_users.email, pending_users.contact, pending_users.department,
                       pending_users.role_id, pending_users.profile_image, pending_users.created_at
                FROM pending_users
                WHERE (pending_users.role_id = 1 OR pending_users.role_id = 2) 
                AND pending_users.department = ?
            `;
            queryParams.push(session.user.department ?? "");
        } else if (userRole === 4) { // Master-Admin Role
            query = `
                SELECT pending_users.id, pending_users.first_name, pending_users.last_name, 
                       pending_users.email, pending_users.contact, pending_users.department,
                       pending_users.role_id, pending_users.profile_image, pending_users.created_at
                FROM pending_users
                WHERE pending_users.role_id = 3
            `;
        }

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
