'use client';
import React from 'react';
import styles from '@/styles/About.module.css';

export default function About() {
    const teamMembers = [
        {
            name: "Gaurav Gupta",
            role: "Full-stack Developer and Database designer.",
            description: "Full-stack developer with expertise in educational technology."
        },
        {
            name: "Shivansh Pataku",
            role: "UI/UX Designer and Full-stack developer.",
            description: "Passionate about creating intuitive learning experiences. "
        }
    ];

    return (
        <div className={styles.aboutContainer}>
            <section className={styles.hero}>
                <h1 className={styles.title}>About Jupiter LMS</h1>
                <p className={styles.subtitle}>
                    Empowering education through technology
                </p>
            </section>

            <section className={styles.mission}>
                <h2>Our Mission</h2>
                <p>
                    To provide an accessible, efficient, and engaging learning 
                    platform that transforms the educational experience for both 
                    students and educators.
                </p>
            </section>

            <section className={styles.features}>
                <h2>What We Offer</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.feature}>
                        <h3>Modern Learning</h3>
                        <p>Interactive digital classrooms with real-time collaboration</p>
                    </div>
                    <div className={styles.feature}>
                        <h3>Track Progress</h3>
                        <p>Comprehensive analytics and progress tracking tools</p>
                    </div>
                    <div className={styles.feature}>
                        <h3>Easy Access</h3>
                        <p>Access your courses anytime, anywhere</p>
                    </div>
                </div>
            </section>

            <section className={styles.team}>
                <h2>Our Team</h2>
                <div className={styles.teamGrid}>
                    {teamMembers.map((member, index) => (
                        <div key={index} className={styles.teamMember}>
                            <h3>{member.name}</h3>
                            <p className={styles.role}>{member.role}</p>
                            <p className={styles.description}>{member.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}