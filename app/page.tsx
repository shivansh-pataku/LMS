import Container_Subjects from '@/components/Container_Subjects';
import Navbar from '@/components/Navbar';
import Container_Classes from '@/components/Container_Classes';

export default function Home() {
  return (
    <>
      <Navbar />
      <Container_Subjects />
      <Container_Classes />
    </>
  );
}
