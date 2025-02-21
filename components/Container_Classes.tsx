import React from 'react';

import styles from './Container_Classes.module.css';

export default function Container_Classes() {
  return (
    <div>

      <div className={styles.Container_Classes}>
        {[1, 2, 3].map((num) => (
          <div key={num} className="styles.item">
            <div className="styles.image"><img src={`image${num}.jpg`} alt={`Image ${num}`} /></div>
            <div className="styles.text">Description {num}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
