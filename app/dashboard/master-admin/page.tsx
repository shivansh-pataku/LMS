import Navbar from '@/components/Navbar';
import Profile from '@/components/DASHBOARD/Profile';
import DashboardMASTER from '@/components/DASHBOARD/DashboardMASTER';

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
      <DashboardMASTER /> 
    </>


  );
}


