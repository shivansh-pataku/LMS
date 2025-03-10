'use client';
import React, { FormEvent, useState } from "react";
import '../../styles/login_signup.css';
import Link from 'next/link';

export default function Signup() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        email: '',
        password: '',
        city_town: '',
        state: '',
        country: '',
        DOB: '',
        role: '',
        department: '',
        profileImage: null as File | null,
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Create FormData to send image and other data
        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'profileImage' && value) {
                submitData.append('profileImage', value);
            } else {
                submitData.append(key, String(value));
            }
        });

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                body: submitData,
            });

            if (!response.ok) {
                throw new Error('Failed to sign up');
            }

            const data = await response.json();
            console.log(data.message); // Handle success (e.g., redirect or show message)
        } catch (error) {
            console.error('Error during signup:', error);
            // Handle error (e.g., show error message)
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size should be less than 5MB');
                return;
            }
            setFormData(prev => ({
                ...prev,
                profileImage: file
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <nav className="logo">
                <Link href="/" style={{ textDecoration: "none", color: "black" }}>Jupyter</Link>
            </nav>

            <h2 className="headingsB">Signing you up</h2>

            <div id="container">
                <div className="box">
                    <form onSubmit={handleSubmit} className="form_signup">
                        <input className="ib" placeholder="First Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <input className="ib" placeholder="Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                        <input className="ib" placeholder="Contact" type="text" name="contact"
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData(prev => ({ ...prev, contact: value }));
                            }}
                            maxLength={10}
                            required value={formData.contact} />
                        <input className="ib" placeholder="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        <input className="ib" placeholder="Date of Birth" type="date" name="DOB" value={formData.DOB} onChange={handleChange} style={{ cursor: 'pointer' }} />
                        <select name="role" className="ib" value={formData.role} onChange={handleChange}>
                            <option value="" defaultValue="">Signup as</option>
                            <option value="student">student</option>
                            <option value="teacher">teacher</option>
                            <option value="admin">admin</option>
                        </select>
                        <select name="department" className="ib" value={formData.department} onChange={handleChange}>
                            <option value="" defaultValue="">Your Department</option>
                            <option value="MCA">MCA</option>
                            <option value="Physics">Physics</option>
                            <option value="Library Sciences">Library Sciences</option>
                        </select>
                        <input className="ib" placeholder="City/Town" type="text" name="city_town" value={formData.city_town} onChange={handleChange} />
                        <input className="ib" placeholder="State" type="text" name="state" value={formData.state} onChange={handleChange} />
                        <input className="ib" placeholder="Country" type="text" name="country" value={formData.country} onChange={handleChange} />
                        <input className="ib" placeholder="Please set a strong password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                        
                        {/* Profile Image Upload */}
                        <div className="image-upload-container">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="ib"
                                id="profile-image"
                                style={{ display: 'none' }}
                            />
                            <label 
                                htmlFor="profile-image" 
                                className="ib" 
                                style={{
                                    display: 'flex',
                                    color: 'green',
                                    cursor: 'pointer'
                                }}
                            >
                                {formData.profileImage ? 'Image Selected ✓' : 'Upload Profile Picture'}
                            </label>
                        </div>

                        <input style={{ fontWeight: 600, fontSize: "14px" }} type="submit" id="submit" value="Sign Up" name="form" />
                    </form>
                </div>
            </div>
        </>
    );
}