import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserMenu.css';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from localStorage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check localStorage for user data
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userString && token) {
          setUserData(JSON.parse(userString));
          
          // Optionally, you can verify with the backend and get fresh data
          try {
            const response = await axios.get('http://localhost:3000/api/user/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.user) {
              // Update userData with fresh data from server
              setUserData(response.data.user);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          } catch (error) {
            console.log('Error fetching updated user data:', error);
            // If the token is invalid, we'll handle logout
            if (error.response && error.response.status === 401) {
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login');
    window.location.reload(); // Force reload to update navigation
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="user-menu-trigger" onClick={toggleMenu}>
        <span className="user-name">{userData ? userData.username : 'Samir Shrestha'}</span>
        <ion-icon name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}></ion-icon>
      </div>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-info">
            <div className="user-details">
              <p className="greeting">Hello,</p>
              <p className="name">{userData ? userData.username : 'Samir Shrestha'}</p>
              <p className="email">{userData ? userData.email : 'sthasamir234@gmail.com'}</p>
            </div>
          </div>
          
          <p className="welcome-message">😊 Welcome! Complete your profile.</p>
          
          <ul className="menu-options">
            <li><Link to="/profile">My profile</Link></li>
            <li><Link to="/applications">My applications <span className="count">0</span></Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><button className="logout-button" onClick={handleLogout}>Log out</button></li>
          </ul>

          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Help Center</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;