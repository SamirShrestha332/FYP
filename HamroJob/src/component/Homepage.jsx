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

    const jobs = [
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Lorem ipsum dolor sitolore, ut nihil sed eos blanditiis error rerum?",
        time: "1 day ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Another job description here.  A longer one this time, to test the layout.",
        time: "3 days ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Yet another job opportunity! This one sounds exciting.",
        time: "5 days ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "A fourth job posting.  We're filling up the grid!",
        time: "1 week ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Fifth job -  almost there! Testing the responsiveness.",
        time: "2 weeks ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "The sixth and final job.  Let's see how it looks!",
        time: "1 month ago",
      },
    ];
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

        <div className="jobsection">
          <h1>Find your Job</h1>
          <p>More than 100 job offers are waiting for you, open-up yourself to a new world of opportunities.</p>
          <div className="job_container">
        {jobs.map((job, index) => (
          <div className="jobs" key={index}>
            <div className="image_sections">
              <img src={job.companyLogo} alt="companylogo" />
            </div>
            <div className="job_info">
              <p className="jobdetails">{job.jobDetails}</p>
              <div className="jobtime_button">
                <p className="time">{job.time}</p>
                <button>View Job</button> {/* Corrected button text */}
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
        <div className="About_us_section"></div>
        <div className="skillcontent_section"></div>

      </div>
    </div>
  );
}

export default Homepage;