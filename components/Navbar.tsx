'use client';

// import React from 'react';
// import styles from './Navbar.module.css';

// export default function Navbar() {
//   return (
//       <div className={styles.navbar}>
//       <a href="#" className={styles.logo}>Jupiter</a>
//       <a href="#home" className={styles.navLink}>Home</a>
//       <a href="#services" className={styles.navLink}>Services</a>
//       <a href="#contact" className={styles.navLink}>Contact</a>
//       <a href="#about" className={styles.navLink}>About</a>
//       <a 
//         href="login.html" 
//         className={styles.SignupLogin} 
//         style={{ backgroundColor: "rgb(123, 123, 123)", marginLeft: "20px", bordder: "2px solid ", borderRadius: "2px" }}
//       >
//         <b>SignIn</b>
//       </a>
//       <a 
//         href="signup.html" 
//         className={styles.SignupLogin} 
//         style={{ backgroundColor: "rgb(9, 121, 9)", marginLeft: "10px", bordder: "2px solid", borderRadius: "2px", width: "50px" }}
//       >
//         <b>SignUp</b>
//       </a>
//     </div>
//   );
// }
import React from 'react';
import Link from 'next/link'; //  Import useNavigate
import styles from './Navbar.module.css';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter(); // Initialize navigate function

  return (
    <div className={styles.navbar}>
      <Link href="/" className={styles.logo}>Jupiter</Link>
      <Link href="/" className={styles.navLink}>Home</Link>
      <Link href="/services" className={styles.navLink}>Services</Link>
      <Link href="/contact" className={styles.navLink}>Contact</Link>
      <Link href="/about" className={styles.navLink}>About</Link>


      <button
        className={styles.SignupLogin}
        onClick={() => router.push('/login')} // ✅ Now navigate is defined
        style={{ backgroundColor: "rgb(123, 123, 123)", marginLeft: "20px", border: "2px solid", borderRadius: "2px" }}
      >
        <b>SignIn</b>
      </button>

      {/* ✅ SignUp Button (Using Link) */}
      <Link
        href="/signup"
        className={styles.SignupLogin}
        style={{ backgroundColor: "rgb(9, 121, 9)", marginLeft: "10px", border: "2px solid", borderRadius: "2px", width: "50px" }}
      >
        <b>SignUp</b>
      </Link>
    </div>
  );
}
