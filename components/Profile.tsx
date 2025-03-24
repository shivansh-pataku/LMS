'use client'
import { useState, useEffect } from "react";
import styles from "./Profile.module.css";

export default function Profile() {
  // Simulated Profile Data (Can be from API or Props)
  const [profile, setProfile] = useState({
    name: "John Doe",
    role: "Teacher",
    dob: "01-01-1996",
    location: "New York, USA",
    bio: "Software Engineer & Tech Enthusiast",
    avatar: "/p.png",
  });

  // Fetching Profile Data from an API (Simulated)
  useEffect(() => {
    // Example: Fetching data (Replace with actual API)
    // fetch("/api/profile").then(res => res.json()).then(data => setProfile(data));

    console.log("Profile data loaded!"); // Debugging
  }, []);

  return (
    <div>
      <div className={styles.boxA}>
        <div className={styles.boxA1}>
          <img
            src={profile.avatar}
            alt="Profile"
            style={{ width: "100%", borderRadius: "10px" }}
          />
          <h5></h5>
        </div>

        <div className={styles.boxA2}>
          <h5 className={styles.detailsHeads}><strong>Information</strong></h5>
          <p className={styles.details}><>{profile.name},{profile.role}</></p>
          <p className={styles.details}><>{profile.dob}</></p>
          <p className={styles.details}><>{profile.location}</></p>
          <p className={styles.details}><>Bio:{profile.bio}</></p>
          <p className={styles.details}><>Departmet:{profile.name}</></p>
        </div>
      </div>
    </div>
  );
}
