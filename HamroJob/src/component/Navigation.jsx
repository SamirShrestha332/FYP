import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import './Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (userString && token && loginStatus === 'true') {
      const userData = JSON.parse(userString);
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="nav">
      <div className="logo" onClick={() => navigate('/')}>
        <img className="logo-img" src="/src/assets/Logo.png" alt="HamroJob Logo" />
      </div>
      <nav>
        <ul>
          <li><Link to="/jobs" className={window.location.pathname === '/jobs' ? 'active' : ''}>Jobs</Link></li>
          <li><Link to="/about-us" className={window.location.pathname === '/about-us' ? 'active' : ''}>About Us</Link></li>
          {isLoggedIn && (
            <li><Link to="/applications" className={window.location.pathname === '/applications' ? 'active' : ''}>My Applications</Link></li>
          )}
        </ul>
      </nav>
      <div className="nav-controls">
        <div className="search-icon" onClick={() => navigate('/jobs')}>
          <ion-icon name="search-outline"></ion-icon>
        </div>
        {isLoggedIn ? (
          <UserMenu userData={user} />
        ) : (
          <div className="auth-buttons">
            <button className="signin-button" onClick={() => navigate('/signup')}>SignUp</button>
            <button className="login-button" onClick={() => navigate('/login')}>LogIn</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navigation; 