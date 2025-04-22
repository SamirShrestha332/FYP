import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './RecruiterStyles.css';

function RecruiterHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // Determine which nav item is active based on current path
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/recruiter/login');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="recruiter-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/recruiter/dashboard" className="logo">
            <h1>HamroJob</h1>
          </Link>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon"></span>
          </button>
        </div>
        
        <nav className={`main-nav ${showMobileMenu ? 'mobile-active' : ''}`}>
          <ul>
            <li className={isActive('/recruiter/dashboard') ? 'active' : ''}>
              <Link to="/recruiter/dashboard">
                <span className="nav-icon dashboard-icon"></span>
                Dashboard
              </Link>
            </li>
            <li className={isActive('/recruiter/jobs') ? 'active' : ''}>
              <Link to="/recruiter/jobs">
                <span className="nav-icon jobs-icon"></span>
                My Jobs
              </Link>
            </li>
            <li className={isActive('/recruiter/post-job') ? 'active' : ''}>
              <Link to="/recruiter/post-job">
                <span className="nav-icon post-job-icon"></span>
                Post a Job
              </Link>
            </li>
            <li className={isActive('/recruiter/applicants') ? 'active' : ''}>
              <Link to="/recruiter/applicants">
                <span className="nav-icon applicants-icon"></span>
                Applicants
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="header-right">
          {user && (
            <div className="user-dropdown">
              <div className="user-profile">
                <div className="user-avatar">
                  {user.firstName ? user.firstName.charAt(0) : user.username ? user.username.charAt(0) : 'U'}
                </div>
                <span className="user-name">{user.firstName || user.username}</span>
                <span className="dropdown-arrow"></span>
              </div>
              
              <div className="dropdown-menu">
                <Link to="/recruiter/profile" className="dropdown-item">
                  <span className="item-icon profile-icon"></span>
                  Profile
                </Link>
                <Link to="/recruiter/company" className="dropdown-item">
                  <span className="item-icon company-icon"></span>
                  Company
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <span className="item-icon logout-icon"></span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default RecruiterHeader;