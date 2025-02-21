import React from "react";
// import styles from "./login_signup.css"; 
import '../../styles/login_signup.css';  // Importing CSSC // orrect way for global CSS


export default function Login() {
    return (
        <>
            {/* Navigation Bar */}
            <nav className="logo">
                <a href="Homepage.html" style={{ textDecoration: "none", color: "black" }}>
                    Jupyter
                </a>
            </nav>

            {/* Heading */}
            <h2 className="headingsB">Login to explore</h2>

            {/* Container */}
            <div id="container">
                <div className="box">
                    <form id="signupForm"> {/* Form without action & method */}

                        {/* Email Input */}
                        <input className="ib" placeholder="E-mail" type="email" id="email" name="email" required />
                        <br /><br />

                        {/* Password Input */}
                        <input className="ib" placeholder="Password" type="password" id="password" name="password" required />
                        <br /><br /><br />

                        {/* Submit Button */}
                        <input style={{ fontWeight: 600, fontSize: "14px" }} type="submit" id="submit" value="Login" />

                        <br />
                        {/* Forgot Password Link */}
                        <a id="forgot_password" href="forgot_password.html">Forgot password?</a>
                        <br /><br />
                    </form>
                </div>
            </div>
        </>
    );
}
