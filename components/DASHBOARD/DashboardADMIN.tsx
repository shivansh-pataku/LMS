'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Menu from './Menu'; 
import ApprovalsADMIN from '@/components/DASHBOARD/ApprovalsADMIN';
import CoursesADMIN from '@/components/DASHBOARD/CoursesADMIN';
import AttandanceADMIN from '@/components/DASHBOARD/AttandanceADMIN';
import ScoresADMIN from '@/components/DASHBOARD/ScoresADMIN';

export default function Dashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>('Courses'); // Default selection

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Approvals': return <ApprovalsADMIN />;
      case 'Courses': return <CoursesADMIN />;
      case 'Attandance': return <AttandanceADMIN />;
      case 'Scores': return <ScoresADMIN />;
      default: return <CoursesADMIN />;
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
