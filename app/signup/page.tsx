import React from "react";

import '../../styles/login_signup.css';

export default function Login() {

    return (

    <>
    </>
    <nav className="logo">
    <a href="Homepage.html" style={{textDecoration: "none", color: "black"}}>Jupyter</a>
    </nav>

<h2 className="headingsB">signing you up</h2>

<div id="container">
<div className="box">

<form action="" method="">




<label for="First Name"> </label><br>
<input  className="ib" placeholder="First Name" type="text" name="f_nmae" ><br>

<label for="Last Name"> </label><br>
<input  className="ib" placeholder="Last Name" type="email" name="l_nmae" ><br>

<label for="Contact"> </label><br>
<input  className="ib" placeholder="Contact" type="text" name="Contact" oninput="this.value = this.value.replace(/[^0-9]/g, '')" maxlength="10"><br>

<label for="email"> </label><br>
<input  className="ib" placeholder="e-mail" type="email" name="email" ><br>

<label for="password"> </label><br>
<input  className="ib" placeholder="Please set a strong password" type="password" name="password" required><br><br><br>


<input style="font-weight:600; font-size: 14px;" type="submit" id="submit" value="signup" name="form">




</form>
</div>
</div>
</>

);
}





// import React from "react";
// import './login_signup.css';


// export default function Login() {

// return (

//     <>
//     </>
//     <nav className="logo">
//     <a href="Homepage.html" style={{textDecoration: "none", color: "black"}}>Jupyter</a>
//     </nav>

// <h2 className="headingsB">signing you up</h2>

// <div id="container">
// <div className="box">

// <form action="" method="">




// <label for="First Name"> </label><br>
// <input  className="ib" placeholder="First Name" type="text" name="f_nmae" ><br>

// <label for="Last Name"> </label><br>
// <input  className="ib" placeholder="Last Name" type="email" name="l_nmae" ><br>

// <label for="Contact"> </label><br>
// <input  className="ib" placeholder="Contact" type="text" name="Contact" oninput="this.value = this.value.replace(/[^0-9]/g, '')" maxlength="10"><br>

// <label for="email"> </label><br>
// <input  className="ib" placeholder="e-mail" type="email" name="email" ><br>

// <label for="password"> </label><br>
// <input  className="ib" placeholder="Please set a strong password" type="password" name="password" required><br><br><br>


// <input style="font-weight:600; font-size: 14px;" type="submit" id="submit" value="signup" name="form">




// </form>
// </div>
// </div>
// </>

// );
// }


