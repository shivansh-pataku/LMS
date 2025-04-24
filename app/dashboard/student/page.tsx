import Navbar from '@/components/Navbar';
import Profile from '@/components/DASHBOARD/Profile';
import DashboardSTUDENT from '@/components/DASHBOARD/DashboardSTUDENT';

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
      <DashboardSTUDENT /> 
    </>
  );
}


