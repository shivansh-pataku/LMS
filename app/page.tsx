import Navbar from '@/components/Navbar';
import Container_Subjects from '@/components/Container_Subjects';
import Container_Classes from '@/components/Container_Classes';

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
