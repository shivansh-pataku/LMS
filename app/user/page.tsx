import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Navbar from '@/components/Navbar';
import Profile from '@/components/DASHBOARD/Profile';
import DashboardSTUDENT from '@/components/DASHBOARD/DashboardSTUDENT';
import DashboardTEACHER from '@/components/DASHBOARD/DashboardTEACHER';
import DashboardADMIN from '@/components/DASHBOARD/DashboardADMIN';
import Dashboard from '@/components/DASHBOARD/Dashboard';
import { redirect } from 'next/navigation';






export default async function User() {
  
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');

    const renderDashboard = () => {
      switch (session.user.role) {
        case 'student':
          return <DashboardSTUDENT userId={session.user.id} />;
        case 'teacher':
          return <DashboardTEACHER userId={session.user.id} />;
        case 'admin':
          return <DashboardADMIN userId={session.user.id} />;
        default:
          return <div>Invalid role</div>;
      }
  }

  return (
    <>
      <Navbar />
      <Profile />
      <Dashboard /> 
      {renderDashboard()}
    </>
  );
}


}


