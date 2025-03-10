import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter(); // Initialize navigate function

  const handleLogin = () => {
      router.push('/login'); // Navigate to the login page
  };

  return (
    <div className={styles.navbar}>
      <Link href="/" className={styles.logo}>Jupiter</Link>
      <Link href="#home" className={styles.navLink}>Home</Link>
      <Link href="#services" className={styles.navLink}>Services</Link>
      <Link href="#contact" className={styles.navLink}>Contact</Link>
      <Link href="#about" className={styles.navLink}>About</Link>
      <button onClick={handleLogin} className={styles.SignupLogin}>
        <b>SignIn</b>
      </button>
      <Link href="/signup" className={styles.SignupLogin}>
        <b>SignUp</b>
      </Link>
    </div>
  );
}