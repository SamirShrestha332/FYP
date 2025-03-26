import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserSettings.css';

function UserSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
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
        
        // Then fetch updated data from server
        try {
          const response = await axios.get('http://localhost:3000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.user) {
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (serverError) {
          console.error('Error fetching user data from server:', serverError);
          // We don't set an error here since we're falling back to localStorage data
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const validatePasswordForm = () => {
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('Changing password...');
      console.log('Current user data:', user);
      console.log('Request payload:', {
        currentPassword,
        newPassword,
        email: user.email
      });
      
      // Call the API to change password using the updated endpoint without /api prefix
      // Include the user email for identification
      const response = await axios.post(
        'http://localhost:3000/users/change-password',
        {
          currentPassword,
          newPassword,
          email: user.email // Add email for user identification
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Password change response:', response.data);
      
      if (response.data && response.data.success) {
        setSuccess('Password has been changed successfully');
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.data?.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      console.error('Error details:', err.response?.data);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    console.log('Logging out...');
    
    // Clear all authentication-related items from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    
    // Add a small delay to ensure localStorage changes are processed
    setTimeout(() => {
      console.log('Redirecting to login page...');
      navigate('/login');
    }, 100);
  };

  if (loading && !user) return <div className="loading">Loading...</div>;
  if (error && !user) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

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
            <li>
              <Link to="/applications">
                My applications
                <span className="count">0</span>
              </Link>
            </li>
            <li className="active">
              <Link to="/settings">
                Settings
              </Link>
            </li>
            <li>
              <button 
                className="logout-button" 
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#007bff', 
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '8px 0',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                Log out
              </button>
            </li>
          </ul>
        </div>

        <div className="profile-content">
          <div className="settings-section">
            <h2>Settings</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="settings-card">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <ion-icon name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}></ion-icon>
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <ion-icon name={showNewPassword ? "eye-off-outline" : "eye-outline"}></ion-icon>
                    </button>
                  </div>
                  <small>Password must be at least 8 characters long</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <ion-icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}></ion-icon>
                    </button>
                  </div>
                </div>
                
                <button type="submit" className="change-password-btn" disabled={loading}>
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>
            
            <div className="settings-card">
              <h3>Account Settings</h3>
              <div className="account-options">
                <div className="account-option">
                  <div className="option-info">
                    <h4>Email Notifications</h4>
                    <p>Receive job alerts and application updates via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="account-option">
                  <div className="option-info">
                    <h4>Profile Visibility</h4>
                    <p>Allow recruiters to view your profile</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="account-option">
                  <div className="option-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="settings-card">
              <h3>Danger Zone</h3>
              <div className="danger-zone">
                <div className="danger-option">
                  <div className="option-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <button className="delete-account-btn">Delete Account</button>
                </div>
              </div>
            </div>
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

export default UserSettings;