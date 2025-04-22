import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserApplications.css';

function UserApplications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage first
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First get user from localStorage
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userString || !token) {
          navigate('/login');
          return;
        }
        
        // Set initial user data from localStorage
        const userData = JSON.parse(userString);
        setUser(userData);
        
        // Then fetch applications from server
        try {
          const response = await fetch(`http://localhost:5000/api/applications/user/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch applications');
          }
          
          const data = await response.json();
          console.log('Applications data:', data); // Debug log
          setApplications(data.applications || []);
        } catch (fetchError) {
          console.error('Error fetching applications:', fetchError);
          setError('Failed to fetch your applications. Please try again later.');
        }
        
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to fetch your applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const getFilteredApplications = () => {
    if (activeFilter === 'all') {
      return applications;
    }
    
    return applications.filter(app => app.status.toLowerCase() === activeFilter);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !user) return <div className="error">{error}</div>;

  return (
    <div className="full-page-container">
      {/* Navigation from Homepage */}
      <div className="nav">
        <div className="logo">
          <img className="Logo" src="/src/assets/Logo.png" alt="Job Portal Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Jobs</a></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/applications">My Applications</a></li>
          </ul>
        </nav>
        <div className="nav-controls">
          <div className="search-icon">
            <ion-icon name="search-outline" className="search-outline"></ion-icon>
          </div>
          {user && <div className="user-menu-trigger">
            <span className="user-name">{user.username}</span>
            <ion-icon name="chevron-down-outline"></ion-icon>
          </div>}
        </div>
      </div>

      <div className="user-profile-container">
        <div className="profile-sidebar">
          <div className="profile-header">
            <h3>My profile</h3>
          </div>
          <ul className="profile-menu">
            <li>
              <Link to="/profile">
                My profile
              </Link>
            </li>
            <li className="active">
              <Link to="/applications">
                My applications
                <span className="count">{applications.length}</span>
              </Link>
            </li>
            <li>
              <Link to="/settings">
                Settings
              </Link>
            </li>
            <li>
              <Link to="#" onClick={handleLogout}>
                Log out
              </Link>
            </li>
          </ul>
        </div>

        <div className="profile-content">
          <div className="applications-section">
            <h2>My Applications</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="filter-tabs">
              <button 
                className={activeFilter === 'all' ? 'active' : ''} 
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={activeFilter === 'active' ? 'active' : ''} 
                onClick={() => handleFilterChange('active')}
              >
                Active
              </button>
              <button 
                className={activeFilter === 'rejected' ? 'active' : ''} 
                onClick={() => handleFilterChange('rejected')}
              >
                Rejected
              </button>
              <button 
                className={activeFilter === 'completed' ? 'active' : ''} 
                onClick={() => handleFilterChange('completed')}
              >
                Completed
              </button>
            </div>
            
            {getFilteredApplications().length > 0 ? (
              <div className="applications-list">
                {getFilteredApplications().map((app) => (
                  <div key={app.id} className={`application-card ${app.status.toLowerCase()}`}>
                    <div className="company-logo">
                      <img src={app.companyLogo || "/src/assets/Companylogo.png"} alt={app.companyName} />
                    </div>
                    <div className="application-details">
                      <h3>{app.jobTitle}</h3>
                      <p className="company-name">{app.companyName}</p>
                      <p className="application-date">Applied on: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Pending'}</p>
                      <p className="application-status">Status: <span className={app.status.toLowerCase()}>{app.status}</span></p>
                    </div>
                    <div className="application-actions">
                      <button 
                        className="view-application"
                        onClick={() => navigate(`/application-details/${app.id}`)}
                      >
                        View Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applications">
                <p>You don't have any {activeFilter !== 'all' ? activeFilter : ''} applications yet.</p>
                <p>Browse jobs and start applying!</p>
                <Link to="/" className="browse-jobs-btn">Browse Jobs</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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

export default UserApplications;