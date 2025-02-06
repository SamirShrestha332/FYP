import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./Homepage.css";



function Homepage() {
  return (
   <>
 <div className="Homepage_container">
      <div className="homepage">
         
        <div className="nav">
          <div className="logo">
            <img className="Logo" src="/src/assets/Logo.png" alt="Job Portal Logo" />
          </div>
          <nav>
            <ul>
              <li><a href="#">Jobs</a></li> 
              <li><a href="#">About Us</a></li>
            </ul>
          </nav>

          <div className="nav-controls">
            <div className="search-icon">
            <ion-icon name="search-outline" className="search-outline"></ion-icon>
            </div>
            <button className="signin-button">SignIn</button>
            <button className="login-button">LogIn</button>
            </div>
           </div>

           <section className="hero">  
          <div className="hero-content">
            <h1>Get ready with Hamro Job</h1>
            <p>Find your future job, internship, or training</p>
            <div className="search-bar">
              <input type="text" placeholder="Profession, company, training..." />
              <button>Search</button> 
            </div>
          </div>
          <div className="hero-image"><img src="/src/assets/HeroImage.jpeg" alt="" /></div>
        </section>
     

      </div>
    </div>

<div className="jobsection"></div>
<div className="About_us_section"></div>
<div className="skillcontent_section"></div>


   </>

  );
}


export default Homepage;
