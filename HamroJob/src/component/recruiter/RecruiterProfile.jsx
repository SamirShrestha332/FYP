import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Subscription state
  const [subscription, setSubscription] = useState(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation states
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Pre-fill form with user data
      setFirstName(parsedUser.firstName || '');
      setLastName(parsedUser.lastName || '');
      setEmail(parsedUser.email || '');
      setCompanyName(parsedUser.companyName || '');
      setCompanyDescription(parsedUser.companyDescription || '');
      setWebsite(parsedUser.website || '');
      
      // Check for subscription data
      const paymentPlan = localStorage.getItem('paymentPlan');
      if (paymentPlan) {
        setSubscription(JSON.parse(paymentPlan));
      } else {
        // If no local subscription data, fetch from server
        fetchSubscriptionData(parsedUser.id);
      }
      
      setLoading(false);
    } else {
      navigate('/recruiter/login');
    }
  }, [navigate]);
  
  // Fetch subscription data from server
  const fetchSubscriptionData = async (recruiterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recruiter/subscription/${recruiterId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.subscription) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    navigate('/recruiter/login');
  };
  
  // Validation functions
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim() || !emailRegex.test(value)) {
      setEmailValid(false);
      return false;
    }
    setEmailValid(true);
    return true;
  };
  
  const validatePassword = (value) => {
    if (value && value.length < 6) {
      setPasswordValid(false);
      return false;
    }
    setPasswordValid(true);
    return true;
  };
  
  const validateConfirmPassword = (value) => {
    if (newPassword && value !== newPassword) {
      setConfirmPasswordValid(false);
      return false;
    }
    setConfirmPasswordValid(true);
    return true;
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate email
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, you would call your API to update the profile
      // For now, we'll simulate a successful API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data in localStorage
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        companyName,
        companyDescription,
        website
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'An error occurred while updating your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    const isPasswordValid = validatePassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      setError("Please correct the errors in the password form.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, you would call your API to update the password
      // For now, we'll simulate a successful API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'An error occurred while updating your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="recruiter-dashboard">
      <RecruiterHeader />
      
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Profile Settings</h1>
          <p>Manage your account and company information</p>
        </div>
        
        {success && (
          <div className="success-message">
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="profile-sections">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  className={emailValid === false ? 'invalid' : ''}
                />
                {emailValid === false && <div className="validation-error">Please enter a valid email address</div>}
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyDescription">Company Description</label>
                <textarea
                  id="companyDescription"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="website">Company Website</label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Subscription Information Section */}
          <div className="profile-section">
            <h2>Subscription Plan</h2>
            {subscription ? (
              <div className="subscription-info">
                <div className="subscription-status">
                  <span className="status-badge active">Active</span>
                </div>
                
                <div className="plan-details">
                  <div className="plan-info-row">
                    <span className="plan-label">Current Plan:</span>
                    <span className="plan-value">
                      {subscription.plan === 'premium' && 'Premium Plan'}
                      {subscription.plan === 'standard' && 'Standard Plan'}
                      {subscription.plan === 'basic' && 'Basic Plan'}
                    </span>
                  </div>
                  
                  <div className="plan-info-row">
                    <span className="plan-label">Job Posts:</span>
                    <span className="plan-value">
                      {subscription.jobPostsRemaining === -1 ? 'Unlimited' : 
                      `${subscription.jobPostsRemaining} posts remaining`}
                    </span>
                  </div>
                  
                  <div className="plan-info-row">
                    <span className="plan-label">Expires On:</span>
                    <span className="plan-value">{subscription.expiryDate}</span>
                  </div>
                </div>
                
                <div className="upgrade-section">
                  <p className="upgrade-text">Want to post more jobs or extend your subscription?</p>
                  <button 
                    onClick={() => navigate('/recruiter/payment')} 
                    className="upgrade-btn"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-subscription">
                <p>You don't have an active subscription plan.</p>
                <p>Subscribe to post jobs on our platform.</p>
                <button 
                  onClick={() => navigate('/recruiter/payment')} 
                  className="subscribe-btn"
                >
                  Get a Subscription
                </button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Change Password</h2>
            <form className="password-form" onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value);
                    if (confirmPassword) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  className={passwordValid === false ? 'invalid' : ''}
                />
                {passwordValid === false && <div className="validation-error">Password must be at least 6 characters</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                  className={confirmPasswordValid === false ? 'invalid' : ''}
                />
                {confirmPasswordValid === false && <div className="validation-error">Passwords do not match</div>}
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterProfile;