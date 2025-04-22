import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userString || !token) {
          navigate('/login');
          return;
        }
        
        // Set initial user data from localStorage
        const userData = JSON.parse(userString);
        console.log('User data from localStorage:', userData);
        
        // Initialize form data with user data
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          skills: userData.skills || ''
        });
        
        // Fetch fresh data from server
        console.log('Fetching user data from server for email:', userData.email);
        try {
          const response = await axios.get(
            `http://localhost:5000/users/profile?email=${encodeURIComponent(userData.email)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('Server response:', response.data);
          
          if (response.data && response.data.success && response.data.user) {
            const freshUserData = response.data.user;
            console.log('Fresh user data from server:', freshUserData);
            
            // Update user state with fresh data
            setUser(freshUserData);
            
            // Update form data with fresh user data
            setFormData({
              username: freshUserData.username || '',
              email: freshUserData.email || '',
              phone: freshUserData.phone || '',
              location: freshUserData.location || '',
              bio: freshUserData.bio || '',
              skills: freshUserData.skills || ''
            });
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));
          } else {
            console.warn('Server response did not contain user data');
          }
        } catch (serverErr) {
          console.error('Error fetching user data from server:', serverErr);
          if (serverErr.response) {
            console.error('Server error response:', serverErr.response.data);
          }
          // We continue with localStorage data
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Ensure email is included in the form data for user identification
      console.log('Updating profile with data:', formData);
      console.log('Using token:', token);
      
      // Use the updated endpoint without /api prefix
      const response = await axios.put(
        'http://localhost:5000/users/profile/update',
        { ...formData, email: user.email }, // Include email in the request for user identification
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Profile update response:', response.data);
      
      if (response.data && response.data.success) {
        // Update user state with response data
        if (response.data.user) {
          setUser(response.data.user);
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // Fallback: update user state with form data
          const updatedUser = { ...user, ...formData };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Exit edit mode
        setEditMode(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    console.log('Logging out from UserProfile...');
    
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
      {/* Use the Navigation component */}
      <Navigation />

      <div className="user-profile-container">
        <div className="profile-sidebar">
          <div className="profile-header">
            <h3>My profile</h3>
          </div>
          <ul className="profile-menu">
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <Link to="#" onClick={() => setActiveTab('profile')}>
                My profile
              </Link>
            </li>
            <li className={activeTab === 'applications' ? 'active' : ''}>
              <Link to="/applications">
                My applications
                <span className="count">0</span>
              </Link>
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''}>
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
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ion-icon name="log-out-outline" style={{ marginRight: '5px' }}></ion-icon>
                Log out
              </button>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
            </li>
          </ul>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              {successMessage && <div className="success-message">{successMessage}</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="profile-header-content">
                <div className="profile-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h2>{user.username || 'User'}</h2>
                  <p>Visible to recruiters {!editMode && 
                    <ion-icon 
                      name="pencil-outline" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => setEditMode(true)}
                    ></ion-icon>
                  }</p>
                  {!editMode && <button className="preview-profile-btn">Preview profile</button>}
                  {editMode && <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>}
                </div>
              </div>

              {!editMode ? (
                <>
                  <div className="profile-details">
                    <div className="detail-group">
                      <h4>Personal Information</h4>
                      <p><strong>Name:</strong> {user.username || 'Not provided'}</p>
                      <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
                      <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                      <p><strong>Location:</strong> {user.location || 'Not provided'}</p>
                    </div>
                    
                    <div className="detail-group">
                      <h4>About Me</h4>
                      <p>{user.bio || 'No information provided'}</p>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Skills</h4>
                      <p>{user.skills || 'No skills listed'}</p>
                    </div>
                  </div>
                  
                  <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="edit-profile-form">
                  <div className="form-group">
                    <label htmlFor="username">Name</label>
                    <input 
                      type="text" 
                      id="username" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input 
                      type="text" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input 
                      type="text" 
                      id="location" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bio">About Me</label>
                    <textarea 
                      id="bio" 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="skills">Skills (comma separated)</label>
                    <textarea 
                      id="skills" 
                      name="skills" 
                      value={formData.skills} 
                      onChange={handleInputChange} 
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div className="applications-section">
              <h2>My Applications</h2>
              <p>You don't have any applications yet.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Settings</h2>
              <p>Settings page content</p>
            </div>
          )}
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

export default UserProfile;