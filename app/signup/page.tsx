'use client';
import React, {FormEvent, useState} from "react";
import '../../styles/login_signup.css';
import Link from 'next/link';

export default function Signup() {

        const [formData, setFormData] = useState({

            firstName : '',
            lastName : '',
            contact : '',
            email : '',
            password : '',
            city_town : '',
            state : '',
            country : '',
            DOB : '',
            role : '',
            department : '',
            profileImage: null as File | null,
        });



        const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            
            // Create FormData to send image
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'profileImage' && value) {
                    submitData.append('profileImage', value);
                } else {
                    submitData.append(key, String(value));
                }
            });
        
            console.log('form submitted', formData);
            // Add your API call here to handle form submission with image
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
            const {name, value} = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        };



return (

    <>

    <nav className="logo">
    <Link href="/" style={{textDecoration: "none", color: "black"}}>Jupyter</Link>
    </nav>

<h2 className="headingsB">signing you up</h2>

<div id="container">
<div className="box">

<form onSubmit={handleSubmit} className="form_signup">


{/* <label htmlFor="firstName"> </label>  */}
<input  className="ib" placeholder="First Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required /> 

{/* <label htmlFor="lastName"> </label> */}
<input  className="ib" placeholder="Last Name" type="text" name="lastName" value={formData.lastName}  onChange={handleChange} />

{/* <label htmlFor="Contact"> </label><br/> */}
<input  className="ib" placeholder="Contact" type="text" name="Contact"
            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData(prev => ({...prev, contact: value}));
                            }}
                            maxLength={10}
                            required value={formData.contact}/> 

{/* <label htmlFor="email"> </label>  */}
<input  className="ib" placeholder="e-mail" type="email" name="email" value={formData.email} onChange={handleChange} />

{/* <label htmlFor="DOB"> </label><br/> */}
<input  className="ib" placeholder="Date of Birth" type="date" name="DOB" value={formData.DOB}  onChange={handleChange} style={{cursor: 'pointer'}}/>

{/* <label htmlFor="role"></label> */}
<select name="role" className="ib" value={formData.role} onChange={handleChange}>
                    <option value="" defaultValue="">Signup as</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                </select>

<select name="department" className="ib" value={formData.department} onChange={handleChange}>
                    <option value="" defaultValue="">Your Department</option>
                    <option value="MCA">MCA</option>
                    <option value="Physics">Physics</option>
                    <option value="Library Sciences">Library Sciences</option>
                </select>

{/* CITY/TOWN,COUNTRY, */}

{/* <label htmlFor="City/Town"> </label><br/> */}
<input  className="ib" placeholder="City/Town" type="text" name="city_town" value={formData.city_town}  onChange={handleChange} />

{/* <label htmlFor="State"> </label> */}
<input  className="ib" placeholder="State" type="text" name="state" value={formData.state}  onChange={handleChange} />

{/* <label htmlFor="Country"> </label><br/> */}
<input  className="ib" placeholder="Country" type="text" name="country" value={formData.country}  onChange={handleChange} />


{/* <label htmlFor="password"> </label><br/> */}
<input  className="ib" placeholder="Please set a strong password" type="password" name="password"  value={formData.password} onChange={handleChange} required />



{/* //////////////////////////////////////////////////////////////////////////////////// */}


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




{/* //////////////////////////////////////////////////////////////////////////////////// */}


<input style={{fontWeight: 600, fontSize: "14px"}} type="submit" id="submit" value="signup" name="form" />




</form>
</div>
</div>
</>
    );
}