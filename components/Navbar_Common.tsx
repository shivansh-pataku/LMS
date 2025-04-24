import React from 'react';
import Link from 'next/link';
import styles from './Navbar_Common.module.css';

export default function Scores() {
    return (
        <nav className={styles.logo}>
        <Link href="/" style={{ textDecoration: "none", color: "black" }}>Jupyter</Link>
        </nav>
    );
}