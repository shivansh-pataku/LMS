import Navbar from '@/components/Navbar';
import Profile from '@/components/DASHBOARD/Profile';
import DashboardTEACHER from '@/components/DASHBOARD/DashboardTEACHER';

// interface UserProfile {
//   name: string;
//   email: string;
//   role: string;
//   department?: string;
//   profileImage?: string;
// }

export default function User() {
  return (
    <>
      <Navbar />
      {/* <Profile /> */}
      <DashboardTEACHER /> 
    </>


  );
}


