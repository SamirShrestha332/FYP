import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OTPVerification.css';

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(360); 
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  
  // Add success state
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Get email and user type from location state
  const email = location.state?.email || '';
  const userType = location.state?.userType || 'seeker';
  
  useEffect(() => {
    // Redirect to signup if no email is provided
    if (!email) {
      navigate('/signup');
      return;
    }
    
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [email, navigate]);
  
  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Add animation class
    setActiveInput(index);
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  // Handle key down events
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus on the last input
      inputRefs.current[5].focus();
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/resend-otp', { email });
      
      if (response.data.success) {
        // Reset timer and disable resend button
        setTimer(360);
        setResendDisabled(true);
        setError('');
        
        // Start countdown again
        const interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              setResendDisabled(false);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    
    // Validate OTP
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Send verification request to server
      const response = await axios.post('http://localhost:5000/verify-otp', {
        email,
        otp: otpValue
      });
      
      if (response.data.success) {
        // Show success message and popup
        setSuccess(true);
        setSuccessMessage('Account created successfully! Redirecting to Login Page...');
        
        // Redirect to appropriate login page after 3.5 seconds
        setTimeout(() => {
          navigate(userType === 'recruiter' ? '/recruiter/login' : '/login');
        }, 3500);
      } else {
        setError(response.data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="otp-container">
      <div className="otp-card">
        {success ? (
          <div className="success-popup">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4BB543" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Success!</h2>
            <p>{successMessage}</p>
          </div>
        ) : (
          <>
            <h2>Verify Your Email</h2>
            <p>We've sent a verification code to <span className="email">{email}</span></p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleVerify}>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    className={`otp-input ${activeInput === index ? 'active' : ''}`}
                    disabled={loading}
                    autoComplete="off"
                  />
                ))}
              </div>
              
              <div className="timer">
                Time remaining: <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
              
              <button 
                type="submit" 
                className="verify-button" 
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            
            <div className="resend-container">
              <span className="resend-text">Didn't receive the code?</span>
              <button 
                onClick={handleResendOTP} 
                className="resend-button" 
                disabled={resendDisabled || loading}
              >
                Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OTPVerification;


// Update the verifyOTP function
const verifyOTP = async () => {
  // Check if OTP is complete
  if (otp.some(digit => digit === '')) {
    setError('Please enter the complete 6-digit code');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    const otpString = otp.join('');
    console.log('Verifying OTP:', otpString, 'for email:', email);
    
    const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email,
      otp: otpString,
      userType // Make sure to include the user type
    });
    
    console.log('OTP verification response:', response.data);
    
    if (response.data.success) {
      setSuccess(true);
      setSuccessMessage('Email verified successfully!');
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', userType);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(userType === 'recruiter' ? '/recruiter/dashboard' : '/profile');
      }, 1500);
    } else {
      setError(response.data.message || 'Verification failed. Please try again.');
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    setError(error.response?.data?.message || 'An error occurred during verification. Please try again.');
  } finally {
    setLoading(false);
  }
};