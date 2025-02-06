import React from "react";
import { useNavigate } from 'react-router-dom';

import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="Homepage_container"> {/* Removed unnecessary <> </> fragments */}
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
              <ion-icon name="search-outline" className="search-outline"></ion-icon> {/* Make sure you have Ionicons installed */}
            </div>
            <button className="signin-button" onClick={handleSignUpClick}>SignUp</button>
            <button className="login-button" onClick={handleLoginClick}>LogIn</button> {/* Changed to button, added onClick */}
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
          <div className="hero-image"><img src="/src/assets/HeroImage.jpeg" alt="Hero Image" /></div>
        </section>

        <div className="jobsection"></div>
        <div className="About_us_section"></div>
        <div className="skillcontent_section"></div>

      </div>
    </div>
  );
}

export default Homepage;