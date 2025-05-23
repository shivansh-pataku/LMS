'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Menu from './Menu';
import CoursesMASTER from '@/components/DASHBOARD/CoursesMASTER';
import AttandanceMASTER from '@/components/DASHBOARD/AttandanceMASTER';
import ScoresMASTER from '@/components/DASHBOARD/ScoresMASTER';
import ApprovalsMASTER from '@/components/DASHBOARD/ApprovalsMASTER'; // Placeholder for Approvals component

export default function Dashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>('Courses'); // Default selection

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Approvals': return <ApprovalsMASTER />; // Placeholder for Approvals component
      case 'Courses': return <CoursesMASTER />;
      case 'Attandance': return <AttandanceMASTER />;
      case 'Scores': return <ScoresMASTER />;
      default: return <CoursesMASTER />;
    }
  };

  return (
    <div className={styles.boxB}>
        <div className={styles.boxB1}>  {/*   // menubox */}
          <h4 className={styles.boxB1_headings}>Menu</h4>
          <Menu onSelect={setSelectedComponent} />  {/* Pass the function correctly */}
        </div>


        <div className={styles.boxB2}>  {/*   // contentbox */}
          <h2>{}</h2>
          {renderComponent()}  {/* Display the selected component */}
        </div>
    </div>
  );
}
