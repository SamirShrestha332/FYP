import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Homepage.css";
import UserMenu from './UserMenu';
import axios from 'axios';

function Homepage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

    // Fetch jobs from API
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.data && response.data.jobs) {
          // Get the latest 6 jobs
          const latest = response.data.jobs.slice(0, 6);
          setFeaturedJobs(latest);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Use dummy data if API fails
        setFeaturedJobs([
          {
            id: 1,
            title: "Frontend Developer",
            company: "Hirely",
            location: "Kathmandu",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Backend Developer",
            company: "Hamro Job",
            location: "Kathmandu",
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "HR Manager",
            company: "Tech Solution",
            location: "Bhaktapur",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    };

    checkLoginStatus();
    fetchJobs();
  }, []);

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${searchTerm}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="homepage-container"> 
      {/* Navigation */}
      <div className="nav">
        <div className="logo">
          <img className="logo-img" src="/src/assets/Logo.png" alt="HamroJob Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/about-us">About Us</a></li>
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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job</h1>
          <p>Discover thousands of job opportunities with all the information you need.</p>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <div className="search-input-wrapper">
                <ion-icon name="briefcase-outline"></ion-icon>
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="search-button">
                Find Jobs
              </button>
            </div>
          </form>
          <div className="search-tags">
            <p>Popular searches:</p>
            <div className="tags">
              <span onClick={() => navigate('/jobs?search=developer')}>Developer</span>
              <span onClick={() => navigate('/jobs?search=designer')}>Designer</span>
              <span onClick={() => navigate('/jobs?search=marketing')}>Marketing</span>
              <span onClick={() => navigate('/jobs?search=remote')}>Remote</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs">
        <div className="section-header">
          <h2>Featured Job Opportunities</h2>
          <p>Find your perfect position in top companies across Nepal</p>
        </div>
        
        <div className="jobs-grid">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job, index) => (
              <div className="job-card" key={index} onClick={() => navigate(`/job/${job.id}`)}>
                <div className="job-card-header">
                  <div className="company-logo">
                    <img src="/src/assets/Companylogo.png" alt={`${job.company} logo`} />
                  </div>
                  <div className="job-meta">
                    <span className="job-date">{formatDate(job.created_at)}</span>
                    <span className="job-type">{job.job_type || 'Full-time'}</span>
                  </div>
                </div>
                <div className="job-card-body">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                  <div className="job-location">
                    <ion-icon name="location-outline"></ion-icon>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="job-card-footer">
                  <button className="view-job-btn">View Details</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">
              <p>Loading job opportunities...</p>
            </div>
          )}
        </div>
        
        <div className="view-more">
          <button className="view-all-btn" onClick={() => navigate('/jobs')}>
            View All Jobs
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How HamroJob Works</h2>
          <p>Simple steps to find your next career opportunity</p>
        </div>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-icon">
              <ion-icon name="search-outline"></ion-icon>
            </div>
            <h3>Search Jobs</h3>
            <p>Browse through our extensive list of jobs across various industries.</p>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <ion-icon name="document-text-outline"></ion-icon>
            </div>
            <h3>Create Profile</h3>
            <p>Build your professional profile and upload your resume.</p>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <ion-icon name="paper-plane-outline"></ion-icon>
            </div>
            <h3>Apply</h3>
            <p>Apply to jobs with a single click and track your applications.</p>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <ion-icon name="briefcase-outline"></ion-icon>
            </div>
            <h3>Get Hired</h3>
            <p>Interview, receive offers, and start your new career journey.</p>
          </div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <section className="about-us-preview">
        <div className="about-content">
          <div className="about-text">
            <h2>Nepal's Premier Job Portal</h2>
            <p>HamroJob connects talented professionals with the best companies across Nepal. Whether you're looking for your first job, a career change, or taking the next step in your professional journey, we're here to help.</p>
            <p>Our platform is designed to make the job search process simple, efficient, and effective for both job seekers and employers.</p>
            <button className="learn-more-btn" onClick={() => navigate('/about-us')}>
              Learn More About Us
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </button>
          </div>
          <div className="about-image">
            <img src="/src/assets/Heroimage2.jpeg" alt="Team working" />
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      {!isLoggedIn && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Take the Next Step in Your Career?</h2>
            <p>Join thousands of professionals who've found their dream jobs through HamroJob</p>
            <div className="cta-buttons">
              <button className="cta-signup" onClick={handleSignUpClick}>
                Create an Account
              </button>
              <button className="cta-login" onClick={handleLoginClick}>
                Sign In
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>About HamroJob</h3>
            <p>Connecting talented professionals with top employers across Nepal since 2025.</p>
            <div className="contact">
              <p><ion-icon name="mail-outline"></ion-icon> info@hamrojob.com</p>
              <p><ion-icon name="call-outline"></ion-icon> +977-1-4123456</p>
            </div>
          </div>
          
          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/jobs">Browse Jobs</a></li>
              <li><a href="/about-us">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-section locations">
            <h3>Our Locations</h3>
            <ul>
              <li><ion-icon name="location-outline"></ion-icon> Kathmandu - Main Office</li>
              <li><ion-icon name="location-outline"></ion-icon> Pokhara</li>
              <li><ion-icon name="location-outline"></ion-icon> Biratnagar</li>
            </ul>
          </div>
          
          <div className="footer-section newsletter">
            <h3>Stay Connected</h3>
            <p>Follow us on social media for updates on new job opportunities.</p>
            <div className="social-icons">
              <a href="#"><ion-icon name="logo-facebook"></ion-icon></a>
              <a href="#"><ion-icon name="logo-twitter"></ion-icon></a>
              <a href="#"><ion-icon name="logo-linkedin"></ion-icon></a>
              <a href="#"><ion-icon name="logo-instagram"></ion-icon></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HamroJob. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;