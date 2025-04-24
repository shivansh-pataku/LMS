'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Menu from './Menu';
import Courses from '@/components/DASHBOARD/Courses';
import Attandance from '@/components/DASHBOARD/Attandance';
import Scores from '@/components/DASHBOARD/Scores';

export default function Dashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>('Courses'); // Default selection

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Courses': return <Courses />;
      case 'Attandance': return <Attandance />;
      case 'Scores': return <Scores />;
      default: return <Courses />;
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
