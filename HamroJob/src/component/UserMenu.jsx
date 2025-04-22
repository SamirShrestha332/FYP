import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserMenu.css';

function UserMenu({ userData: propUserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(propUserData || null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
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
          const parsedUser = JSON.parse(userString);
          setUserData(parsedUser);
          
          // Check if profile is completed (has bio and other details)
          checkProfileCompletion(parsedUser);
          
          // Optionally, you can verify with the backend and get fresh data
          try {
            const response = await axios.get('http://localhost:5000/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.user) {
              // Update userData with fresh data from server
              setUserData(response.data.user);
              // Check if profile is completed with fresh data
              checkProfileCompletion(response.data.user);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Fetch user's application count
            const applicationsResponse = await axios.get('http://localhost:5000/api/applications/user', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (applicationsResponse.data && applicationsResponse.data.applications) {
              setApplicationCount(applicationsResponse.data.applications.length);
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
  }, [propUserData]);

  // Check if user profile is completed
  const checkProfileCompletion = (user) => {
    if (user && 
        user.bio && user.bio.trim() !== '' && 
        user.phone && user.phone.trim() !== '' && 
        user.location && user.location.trim() !== '') {
      setProfileCompleted(true);
    } else {
      setProfileCompleted(false);
    }
  };

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

  const handleTermsClick = () => {
    navigate('/terms');
    setIsOpen(false);
  };

  const handlePrivacyClick = () => {
    navigate('/privacy');
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    navigate('/help');
    setIsOpen(false);
  };

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="user-menu-trigger" onClick={toggleMenu}>
        <ion-icon name="person-circle-outline" class="user-icon"></ion-icon>
        <span className="user-name">{userData ? userData.username : 'User'}</span>
        <ion-icon name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}></ion-icon>
      </div>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-info">
            <div className="user-details">
              <p className="greeting">Hello,</p>
              <p className="name">{userData ? userData.username : 'User'}</p>
              <p className="email">{userData ? userData.email : 'user@example.com'}</p>
            </div>
          </div>
          
          {!profileCompleted && (
            <p className="welcome-message">😊 Welcome! Complete your profile.</p>
          )}
          
          <ul className="menu-options">
            <li><Link to="/profile" onClick={() => setIsOpen(false)}>My profile</Link></li>
            <li>
              <Link to="/applications" onClick={() => setIsOpen(false)}>
                My applications
                <span className="count">{applicationCount}</span>
              </Link>
            </li>
            <li><Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link></li>
          </ul>
          
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>

          <div className="footer-links">
            <a href="#" onClick={handleTermsClick}>Terms of Service</a>
            <a href="#" onClick={handlePrivacyClick}>Privacy Policy</a>
            <a href="#" onClick={handleHelpClick}>Help Center</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;