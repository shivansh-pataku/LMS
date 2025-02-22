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
            role : ''

        });


        const handleSubmit = (event: FormEvent<HTMLFormElement>) => {

            event.preventDefault();
            console.log('form submitted', formData);

        }

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
<input  className="ib" placeholder="Date of Birth" type="date" name="DOB" value={formData.DOB}  onChange={handleChange} />

{/* <label htmlFor="role"></label> */}
<select name="role" className="ib" value={formData.role} onChange={handleChange}>
                    <option value="" defaultValue="">Signup as</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                </select>

{/* CITY/TOWN,COUNTRY, */}

{/* <label htmlFor="City/Town"> </label><br/> */}
<input  className="ib" placeholder="City/Town" type="text" name="City_Town" value={formData.city_town}  onChange={handleChange} />

{/* <label htmlFor="State"> </label> */}
<input  className="ib" placeholder="State" type="text" name="State" value={formData.state}  onChange={handleChange} />

{/* <label htmlFor="Country"> </label><br/> */}
<input  className="ib" placeholder="Country" type="text" name="Country" value={formData.country}  onChange={handleChange} />

{/* DATE BRITH */}



{/* <label htmlFor="City/Town"> </label> */}
<input  className="ib" placeholder="City/Town" type="text" name="City/Town" value={formData.lastName}  onChange={handleChange} />



{/* <label htmlFor="password"> </label><br/> */}
<input  className="ib" placeholder="Please set a strong password" type="password" name="password"  value={formData.password} onChange={handleChange} required /><br/>


<input style={{fontWeight: 600, fontSize: "14px"}} type="submit" id="submit" value="signup" name="form" />




</form>
</div>
</div>
</>
    );
}