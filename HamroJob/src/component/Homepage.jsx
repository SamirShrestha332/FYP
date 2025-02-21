import React from "react";
import { useNavigate } from 'react-router-dom';

import "./Homepage.css";
import heroimage1 from "/src/assets/Heroimage1.jpeg";
import heroimage2 from "/src/assets/Heroimage2.jpeg";
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
        companyname:"Xyz company",
        time: "1 day ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Another job description here.  A longer one this time, to test the layout.",
        companyname:"Xyz company",
        time: "3 days ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Yet another job opportunity! This one sounds exciting.",
        companyname:"Xyz company",
        time: "5 days ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "A fourth job posting.  We're filling up the grid!",
        companyname:"Xyz company",
        time: "1 week ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "Fifth job -  almost there! Testing the responsiveness.",
        companyname:"Xyz company",
        time: "2 week ago",
      },
      {
        companyLogo: "/src/assets/Companylogo.png",
        jobDetails: "The sixth and final job.  Let's see how it looks!",
        companyname:"Xyz company",
        time: "1month ago",
      },
    ];
  return (

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
              <div className="companyname">{job.companyname}</div>
              <div className="jobtime_button">
                <p className="time">{job.time}</p>
                <button>View Job</button> {/* Corrected button text */}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="View_All_Button">View all jobs</button>
        </div>

         <div className="About_us_section">
         
            <div className="image-section-aboutus">
            
                <img src={heroimage1} alt="Workplace Scene 1" />
                <img src={heroimage2} alt="Workplace Scene 2" />
            </div>
            <div className="side-container">
                <div className="title-container">
                    <h1>MOOVIjob</h1>
                </div>
                <div className="description-container">
                    <p>
                        Moovijob.com is a privileged partner if you want to inquire information about Employment & Careers in the territory of the Grand-Duchy of Luxembourg.
                    </p>
                </div>
                <div className="more-info-label">
                    <strong>More information</strong>
                </div>
                <div className="buttons-container">
                    <button>Apply for online job offers.</button>
                    <button>Consult the calendar of our events.</button>
                    <button>Consult our training offers.</button>
                </div>
            </div>
        </div>
        
        <div className="create-account"></div>
        

      </div>
    </div>
  );
}

export default Homepage;