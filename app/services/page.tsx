'use client';
import React from 'react';
import styles from '@/styles/Services.module.css';

export default function Services() {
    const services = [
        {
            title: "Course Management",
            description: "Comprehensive course management system with easy access to materials and resources.",
            badge: "Popular"
        },
        {
            title: "Student Dashboard",
            description: "Personalized dashboard to track your progress and upcoming assignments.",
        },
        {
            title: "Live Sessions",
            description: "Interactive live learning sessions with real-time instructor feedback.",
            badge: "New"
        },
        {
            title: "Assessment Tools",
            description: "Advanced assessment and grading tools for comprehensive evaluation.",
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Our Services</h1>
                <p className={styles.subtitle}>
                    Discover powerful learning tools designed for modern education
                </p>
            </div>

            <div className={styles.servicesGrid}>
                {services.map((service, index) => (
                    <div key={index} className={styles.serviceCard}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.serviceTitle}>{service.title}</h2>
                            {service.badge && (
                                <span className={styles.badge}>{service.badge}</span>
                            )}
                            <p className={styles.serviceDescription}>
                                {service.description}
                            </p>
                            <button className={styles.learnMore}>
                                Learn More
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}