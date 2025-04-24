"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "../../styles/login_signup.css";


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false, // Prevent automatic redirection
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push("/dashboard"); // Redirect after successful login
        }
    };

    return (
        <>
            <nav className="logo">
                <Link href="/" style={{ textDecoration: "none", color: "black" }}>
                    Jupyter
                </Link>
            </nav>

            <h2 className="headingsB">Login to explore</h2>

            <div id="container">
                <div className="box">
                    <form id="signupForm" onSubmit={handleSubmit}>
                        <input className="ib" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <br /><br />
                        
                        <input className="ib" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <br /><br /><br />

                        <input id="submit" type="submit" value="Login" />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <br />


                        <Link id="goto" href="/forgot-password">Forgot password?</Link>
                        <br /><br />
                    </form>
                </div>
            </div>
        </>
    );
}
