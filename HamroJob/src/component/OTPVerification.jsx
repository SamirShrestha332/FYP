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
  const [timer, setTimer] = useState(60); // 60 seconds timer
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  
  // Get email from location state
  const email = location.state?.email || '';
  
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
      const response = await axios.post('http://localhost:3000/verify-otp', {
        email,
        otp: otpValue
      });
      
      if (response.data.success) {
        // Redirect to login page on success
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully! You can now log in.' 
          } 
        });
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
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    setResendDisabled(true);
    setLoading(true);
    
    try {
      // Request new OTP
      const response = await axios.post('http://localhost:3000/resend-otp', {
        email
      });
      
      if (response.data.success) {
        // Reset timer
        setTimer(60);
        
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
        
        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);
        
        // Focus on first input
        inputRefs.current[0].focus();
      } else {
        setError(response.data.message || 'Failed to resend verification code');
        setResendDisabled(false);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend verification code');
      setResendDisabled(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="otp-container">
      <div className="otp-card">
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
      </div>
    </div>
  );
}

export default OTPVerification;