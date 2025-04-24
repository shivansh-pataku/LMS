import Navbar from '@/components/Navbar';
import Container_Subjects from '@/components/HOME/Container_Subjects';
import Container_Classes from '@/components/HOME/Container_Classes';

export default function Home() {
  return (
    <>        
    <Navbar />
      <div className="container">
        <Container_Subjects />
        <Container_Classes />
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