import Sidebar from './Sidebar';
import { Role } from "@/types"; // Import the Role type

const DashboardLayout = ({ children, role }: { children: React.ReactNode; role: Role }) => {
    return (
        <div className="flex min-h-screen">
            <Sidebar role={role} />
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
};

export default DashboardLayout;