import DashboardLayout from '../../../components/DashboardLayout';

const TeacherDashboard = () => {
    return (
        <DashboardLayout role="teacher">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p>Manage your courses, track student performance, and stay updated with notifications.</p>
        </DashboardLayout>
    );
};

export default TeacherDashboard;