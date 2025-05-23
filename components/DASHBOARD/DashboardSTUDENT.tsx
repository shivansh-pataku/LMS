'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Menu from './Menu';
import CoursesSTUDENT from '@/components/DASHBOARD/CoursesSTUDENT';
import AttandanceSTUDENT from '@/components/DASHBOARD/AttandanceSTUDENT';
import ScoresSTUDENT from '@/components/DASHBOARD/ScoresSTUDENT';

export default function Dashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>('Courses'); // Default selection

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Courses': return <CoursesSTUDENT />;
      case 'Attandance': return <AttandanceSTUDENT />;
      case 'Scores': return <ScoresSTUDENT />;
      default: return <CoursesSTUDENT />;
    }
  };
//setSelectedComponent in onSelect prop is used to update the selected component when a menu item is clicked which was passed from the Menu component by the onSelect prop with value item.id
  return (
    <div className={styles.boxB}>
        <div className={styles.boxB1}>  {/*   // menubox */}
          <h4 className={styles.boxB1_headings}>Menu</h4>
          <Menu onSelect={setSelectedComponent} />  {/* Pass the function correctly  */}
        </div>

 
        <div className={styles.boxB2}>  {/*   // contentbox */}
          <h2>{}</h2>
          {renderComponent()}  {/* Display the selected component */}
        </div>
    </div>
  );
}
