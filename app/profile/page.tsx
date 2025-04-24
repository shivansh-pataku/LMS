import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Navbar_Common from '@/components/Navbar_Common';
import LogoutButton from '@/components/LogoutButton';
import Edit_Profile from '@/components/EditProfileButton';
import '../../styles/profile.css';
import '../../styles/login_signup.css';




// Remove 'use client' as this becomes server component
export default async function Profile() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <div>Access Denied</div>;
    }


    return (
        <>
            <Navbar_Common />

            <div style={{ display:"flex",flexDirection:"column",alignItems:"center"}} >

            <div className="cover">
                <img src="/forest.jpg" alt="Cover Image" />
            </div>

            <div className="dp">
                <img src="/dp.jpg" alt="Profile Image" />
            </div>

            <div className="infoBOX">
            <div className="GENERALinfo">
                <h3 className="GENdetails" style={{ fontWeight: "bold" }}>{session.user.first_name + " " + session.user.last_name}</h3>
                <p className="GENdetails">UserID : {session.user.id} and Role : {session.user.role} {}</p>
                <p className="GENdetails"></p>
                <p className="GENdetails">{session.user.email}</p>
                <p className="GENdetails">{session.user.department}, Semester : {session.user.semester}</p> 
                
                <Edit_Profile />
                
                <LogoutButton />
            </div>
            </div>

            </div>

        </>
    );




}