'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css';

const menuItems = [
    { id: 'Classes', label: 'Classes' },
    { id: 'Attandance', label: 'Attandance' },
    { id: 'Scores', label: 'Scores' }
];

export default function Menu({ onSelect }: { onSelect: (id: string) => void }) {
    const [active, setActive] = useState<string>('Classes'); // Default active item

    return (
        <nav className={styles.Menu}>
            <ul>
                {menuItems.map((item) => (
                    <li 
                        key={item.id} 
                        // className={active === item.id ? 'active' : ''} 
                        onClick={() => {
                            setActive(item.id);
                            onSelect(item.id);
                        }}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
