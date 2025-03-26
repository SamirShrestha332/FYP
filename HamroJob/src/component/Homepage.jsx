import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Homepage.css";
import UserMenu from './UserMenu';
import heroimage1 from "/src/assets/Heroimage1.jpeg";
import heroimage2 from "/src/assets/Heroimage2.jpeg";

function Homepage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkLoginStatus = () => {
      const userString = localStorage.getItem('user');
      const loginStatus = localStorage.getItem('isLoggedIn');
      
      if (userString && loginStatus === 'true') {
        setIsLoggedIn(true);
        setUserData(JSON.parse(userString));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

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
              <li><a href="/jobs">Jobs</a></li>
              <li><a href="#">About Us</a></li>
              {isLoggedIn && <li><a href="/applications">My Applications</a></li>}
            </ul>
          </nav>

          <div className="nav-controls">
            <div className="search-icon">
              <ion-icon name="search-outline" className="search-outline"></ion-icon>
            </div>
            {isLoggedIn ? (
              <UserMenu userData={userData} />
            ) : (
              <>
                <button className="signin-button" onClick={handleSignUpClick}>SignUp</button>
                <button className="login-button" onClick={handleLoginClick}>LogIn</button>
              </>
            )}
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
          <p className="Heading">Find your Job</p>
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
         <div className="AboutUs_title">
          <p>A</p>
          <p>B</p>
          <p>O</p>
          <p>U</p>
          <p>T</p>
          <br/>
          <p>U</p>
          <p>S</p>

         </div>
        
            <div className="image-section-aboutus">
            <img src={heroimage2} alt="Workplace Scene 2" />
                <img src={heroimage1} alt="Workplace Scene 1" />
                
            </div>
            <div className="side-container">
                <div className="title-container">
                    <h1 >Hamrojob</h1>
                </div>
                <div className="description-container">
                    <p>
                        HamroJob.com is a privileged partner if you want to inquire information about Employment .
                    </p>
                </div>
                <div className="more-info-label">
                    <strong>More information</strong>
                </div>
                <div className="buttons-container">
                    <a href="#">Apply for online job offers.</a>
                    <a href="#">Consult the calendar of our events.</a>
                    <a href="#">Consult our training offers.</a>
                </div>
            </div>
        </div>
        
        {/* Only show create account section if not logged in */}
        {!isLoggedIn && (
          <div className="create-account-section">
            <div className="create-account-content">
              <h2 className="create-account-title">Create an account</h2>
              <p className="create-account-free">FREE & SECURED</p>
              <p className="create-account-description">Quickly apply to ads and much more...</p>
              <p className="create-account-description">Join the Hamrojob.com community and discover all that your account can offer you.</p>
              <p className="create-account-advantages">The advantages of the Hamrojob.com account</p>
              <div className="create-account-buttons">
                <button className="create-account-signup" onClick={handleSignUpClick}>Sign up</button>
                <button className="create-account-login" onClick={handleLoginClick}>Log in</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Our Locations</h3>
            <ul>
              <li>Kathmandu - Main Office</li>
              <li>Pokhara</li>
              <li>Biratnagar</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul>
              <li>Email: info@hamrojob.com</li>
              <li>Phone: +977-1-4123456</li>
              <li>Address: Kathmandu, Nepal</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#"><ion-icon name="logo-facebook"></ion-icon></a>
              <a href="#"><ion-icon name="logo-twitter"></ion-icon></a>
              <a href="#"><ion-icon name="logo-linkedin"></ion-icon></a>
              <a href="#"><ion-icon name="logo-instagram"></ion-icon></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 HamroJob. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;