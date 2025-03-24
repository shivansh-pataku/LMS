'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../styles/login_signup.css';

export default function ForgotPassword() {
    const [otpVisible, setOtpVisible] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email) {
            alert("Please enter a valid email.");
            return;
        }

        if (!otpVisible) {
            // ✅ Request OTP
            try {
                setLoading(true);
                const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to send OTP");

                alert("OTP sent successfully!");
                setOtpVisible(true);
            } catch (error: unknown) { // ✅ Fixed ESLint issue
                if (error instanceof Error) {
                    console.error("❌ Error sending OTP:", error.message);
                    alert(error.message);
                } else {
                    alert("An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        } else {
            // ✅ Verify OTP
            if (otp.length !== 6) {
                alert("Please enter a valid 6-digit OTP.");
                return;
            }

            try {
                setLoading(true);
                const response = await fetch("/api/auth/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "OTP verification failed");

                alert("OTP Verified! Redirecting to reset password...");
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } catch (error: unknown) { // ✅ Fixed ESLint issue
                if (error instanceof Error) {
                    console.error("❌ Error verifying OTP:", error.message);
                    alert(error.message);
                } else {
                    alert("An error occurred. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <nav className="logo">
                <Link href="/" style={{ textDecoration: "none", color: "black" }}>Jupyter</Link>
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
                        <br /><br />

                        {otpVisible && (
                            <>
                                <input
                                    type="text"
                                    className="ib"
                                    placeholder="Enter the OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // ✅ Allow only numbers
                                    maxLength={6}
                                    required
                                />
                                <br /><br />
                            </>
                        )}

                        <input
                            type="submit"
                            id="submit"
                            value={loading ? "Processing..." : otpVisible ? "Submit OTP" : "Request OTP"}
                            disabled={loading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
