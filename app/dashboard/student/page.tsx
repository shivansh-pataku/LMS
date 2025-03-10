import DashboardLayout from '../../../components/DashboardLayout'; // Ensure this path is correct

const StudentDashboard = () => {
    return (
        <DashboardLayout role="student">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p>Welcome to the student portal. Here you can manage your courses and view your exam results.</p>
        </DashboardLayout>
    );
};

export default StudentDashboard;