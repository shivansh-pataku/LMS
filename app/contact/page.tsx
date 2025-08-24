'use client';
import styles from '@/styles/Contact.module.css';
import { FaEnvelope, FaUser } from 'react-icons/fa'; // Importing React Icons for email and user icons

export default function Contact() {
    return (
        <div className={styles.contactContainer}>
            <h1 className={styles.heading}>Contact Us</h1>
            
            <p className={styles.description}>
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className={styles.contactCard}>
                <div className={styles.contactInfo}>
                    <FaUser className={styles.icon} />
                    <div>
                        <strong>Gaurav Gupta</strong>
                        <div className={styles.contactInfo}>
                            <FaEnvelope className={styles.icon} />
                            <a href="mailto:gouravguptag973@gmail.com">gouravguptag973@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contactCard}>
                <div className={styles.contactInfo}>
                    <FaUser className={styles.icon} />
                    <div>
                        <strong>Shivansh Pataku</strong>
                        <div className={styles.contactInfo}>
                            <FaEnvelope className={styles.icon} />
                            <a href="mailto:patakushivansh@gmail.com">patakushivansh@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}