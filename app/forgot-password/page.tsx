'use client';
import React, { FormEvent, useState } from 'react';
import '../../styles/login_signup.css';
// import React from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
;





export default function Login() {

    const [otpVisible, setOtpVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [otp, setOtp] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !contact) {
            alert("Please enter a valid email and contact.");
            return;
        }

        if (!otpVisible) {
            // First click: Show OTP input
            setOtpVisible(true);
            alert("Please check your email for OTP");
        } else {
            // Second click: Validate and submit
            if (otp.length !== 6) {
                alert("Please enter a valid 6-digit OTP.");
                return;
            }
            alert("Submitted!");
            // Here you would normally send the data to a backend API.
        }
    };

    return (
        <div>
            <nav className="logo">
                <a href="/" style={{ textDecoration: "none", color: "black" }}>Jupyter</a>
            </nav>

            <h2 className="headingsB">Confirm to change your password</h2>

            <div id="container">
                <div className="box">
                    <form onSubmit={handleSubmit}>

                        <input
                            className="ib"
                            placeholder="E-mail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <br />

                        <input
                            className="ib"
                            placeholder="Contact"
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={10}
                            required
                        />
                        <br /><br />

                        {otpVisible && (
                            <input
                                type="text"
                                className="ib"
                                placeholder="Enter the OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                maxLength={6}
                                required
                            />
                        )}
                        <br />

                        <input type="submit" id="submit" value={otpVisible ? "Submit" : "Confirm"} />
                    </form>
                </div>
            </div>
        </div>
    );
}
