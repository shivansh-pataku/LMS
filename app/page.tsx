'use client';
import Navbar from '@/components/Navbar';
import Container_Subjects from '@/components/HOME/Container_Subjects';
import Container_Classes from '@/components/HOME/Container_Classes';
import { useState } from 'react';


export default function Home() {
  const [selectedItem, setSelectedItem] = useState<string>('All Courses'); // Default selected item
    
  return (
    <>
      <Navbar />
      <div className="container">
        <Container_Subjects onselect={setSelectedItem} />
        <Container_Classes selectedItem={selectedItem} />
      </div>
    </>
  );
}

// export default function Home() {
//   return (
//     <>        
//     <Navbar />
//       <div className="container">

//           <div style={{ width: "80%" }} >
//             <Container_Subjects  />
//           </div>
          
//           <div style={{ width:"100%" }} >
//             <Container_Classes  />
//           </div>

//       </div>
//     </>


//   );
// }