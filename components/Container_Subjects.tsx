import React from 'react';
import styles from './Container_Subjects.module.css';

export default function Container_Subjects() {
  return (
    <div className={styles.Container_Subjects}>
      <h2>All Classes</h2>
      <ul>
        <li><a href="#">Creative Career</a></li>
        <li><a href="#">Creativity & Inspiration</a></li>
        <li><a href="#">Design</a></li>
        <li><a href="#">Art & Illustration</a></li>
        <li><a href="#">Film & Video</a></li>
        <li><a href="#">Photography</a></li>
        <li><a href="#">AI & Innovation</a></li>
        <li><a href="#">Animation & 3D</a></li>
        <li><a href="#">Music & Audio</a></li>
        <li><a href="#">Productivity</a></li>
        <li><a href="#">Writing & Publishing</a></li>
        <li><a href="#">Marketing & Business</a></li>
        <li><a href="#">Development</a></li>
        <li><a href="#">Crafts & DIY</a></li>
        <li><a href="#">Home & Lifestyle</a></li>
        <li><a href="#">Personal Development</a></li>
      </ul>
    </div>
  );
}
