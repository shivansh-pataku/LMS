import React from 'react';
import styles from './Container_Subjects.module.css';

export default function Container_Subjects() {
  return (
    <div className={styles.Container_Subjects}>
      <h2>All Classes</h2>
      <ul>
        <li><a href="#">Computer Science</a></li>
        <li><a href="#">Physics</a></li>
        <li><a href="#">Mathematics</a></li>
        <li><a href="#">Chemistary</a></li>
        <li><a href="#">Zoology</a></li>
        <li><a href="#">Photography</a></li>
        <li><a href="#">Geography</a></li>
        <li><a href="#">Political Sciences</a></li>
        <li><a href="#">Adminstration</a></li>
        <li><a href="#">Marketing & Business</a></li>
        <li><a href="#">Development</a></li>
      </ul>
    </div>
  );
}
