import Navbar from '@/components/Navbar';
import Profile from '@/components/Profile';
import Dashboard from '@/components/Dashboard';

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
      <Profile />
      <Dashboard /> 
    </>
  );
}


