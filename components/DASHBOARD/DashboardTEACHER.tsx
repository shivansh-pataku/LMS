'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Menu from './Menu';
import CoursesTEACHER from '@/components/DASHBOARD/CoursesTEACHER';
import AttandanceTEACHER from '@/components/DASHBOARD/AttandanceTEACHER';
import ScoresTEACHER from '@/components/DASHBOARD/ScoresTEACHER';

export default function Dashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>('Courses'); // Default selection

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Courses': return <CoursesTEACHER />;
      case 'Attandance': return <AttandanceTEACHER />;
      case 'Scores': return <ScoresTEACHER />;
      default: return <CoursesTEACHER />;
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
