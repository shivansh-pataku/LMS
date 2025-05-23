'use client';
import React, {useState} from 'react';
import styles from './Container_Subjects.module.css';

const subjectsList = [
  {id: 'All Courses', label: 'All Courses',},
  {id: 'MCA', label: 'MCA',},
  {id: 'Physics', label: 'Physics',},
  {id: 'Mathematics', label: 'Mathematics',},
  {id: 'Chemistry', label: 'Chemistry',},
  {id: 'Zoology', label: 'Zoology',},
  {id: 'Photography', label: 'Photography',},
  {id: 'Geography', label: 'Geography',},
  {id: 'Political Sciences', label: 'Political Sciences',},
  {id: 'Administration', label: 'Administration',},
  // {id: 'Marketing & Business', label: 'Marketing & Business',},
  {id: 'Development', label: 'Development',}
];

interface ContainerSubjectsProps {
  onSelect: (id: string) => void;
}

export default function Container_Subjects({onselect}: {onselect: (id: string) => void}) {
 const [active, setActive] = useState<string>('All Courses'); // Default active item
  return (

    <div className={styles.Container_Subjects}>
      <ul>
        {subjectsList.map((subject) => (
          <li className={styles.Subject}
                    key={subject.id}
                    onClick={() => {
                      setActive(subject.id); // Set the active subject to the clicked one
                      onselect(subject.id); // Call the onselect function with the subject ID
                    }}>

          {subject.label} 
          </li>// display the subject label
        ))}

      </ul>
      </div>

          




  );
}
 
// import styles from './Container_Subjects.module.css';

// export default function Container_Subjects() {
//   return (
//     <div className={styles.Container_Subjects}>
//       <h2>All Classes</h2>
//       <ul>
//         <li><a href="#">Computer Science</a></li>
//         <li><a href="#">Physics</a></li>
//         <li><a href="#">Mathematics</a></li>
//         <li><a href="#">Chemistary</a></li>
//         <li><a href="#">Zoology</a></li>
//         <li><a href="#">Photography</a></li>
//         <li><a href="#">Geography</a></li>
//         <li><a href="#">Political Sciences</a></li>
//         <li><a href="#">Adminstration</a></li>
//         <li><a href="#">Marketing & Business</a></li>
//         <li><a href="#">Development</a></li>
//       </ul>
//     </div>
//   );
// }
