'use client';
import React, { useState } from 'react';
import styles from './Dashboard.module.css'; 

const menuItems = [ // Define the menu items with their IDs and labels which is a list of objects
    { id: 'Approvals', label: 'Approvals' },
    { id: 'Classes', label: 'Classes' },
    { id: 'Attandance', label: 'Attandance' },
    { id: 'Scores', label: 'Scores' }
];


// Define the Menu component which takes a prop onSelect, a function that will be called when a menu item is selected
// The component uses useState to manage the active menu item
// adding onselect prop to the function to handle the selected menu item
// The component maps over the menuItems array to create a list of menu items of type string
// Each menu item is a list item that, when clicked, sets the active item and calls the onSelect function with the item's ID
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
