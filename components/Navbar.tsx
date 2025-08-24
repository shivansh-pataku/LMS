'use client';
import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';



export default function Navbar() {
  

  return (
    <div className={styles.navbar}>
      <Link href="/" className={styles.logo}>EduSphere</Link>
      <Link href="/" className={styles.navLink}>Home</Link>
      <Link href="/services" className={styles.navLink}>Services</Link>
      <Link href="/contact" className={styles.navLink}>Contact</Link>
      <Link href="/profile" className={styles.navLink}>Profile</Link>
      <Link href="/about" className={styles.navLink}>About</Link>


      <Link href="/login" className={styles.signupLogin}
        style={{ backgroundColor: "rgb(123, 123, 123)", marginLeft: "20px", borderRadius: "2px", width: "50px" }}>
        <b>SignIn</b>
      </Link>

      <Link href="/signup" className={styles.signupLogin} 
        style={{ backgroundColor: "rgb(9, 121, 9)", marginLeft: "10px",marginRight: "10px", borderRadius: "2px", width: "50px", right: "10px" }}
      >
        <b>SignUp</b>
      </Link>
    </div>
  );
}
