import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './Login.css';
import Modal from 'react-modal';
Modal.setAppElement('#root');

function ForgotPassword() {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: New password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    // Check if email was passed from login page or stored in localStorage
    useEffect(() => {
        // First check if email was passed via state from the login page
        if (location.state && location.state.email) {
            setEmail(location.state.email);
            validateEmail(location.state.email);
        } else {
            // If not, check if there's a stored email in localStorage
            const storedEmail = localStorage.getItem('lastLoginEmail');
            if (storedEmail) {
                setEmail(storedEmail);
                validateEmail(storedEmail);
            }
        }
    }, [location]);

    // Validation states
    const [emailValid, setEmailValid] = useState(null);
    const [otpValid, setOtpValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);

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

    const validateOtp = (value) => {
        if (!value || value.length !== 6 || !/^\d+$/.test(value)) {
            setOtpValid(false);
            return false;
        }
        setOtpValid(true);
        return true;
    };

    const validatePassword = (value) => {
        if (!value || value.length < 6) {
            setPasswordValid(false);
            return false;
        }
        setPasswordValid(true);
        return true;
    };

    const validateConfirmPassword = (value) => {
        if (!value || value !== newPassword) {
            setConfirmPasswordValid(false);
            return false;
        }
        setConfirmPasswordValid(true);
        return true;
    };

    // Handle input changes with validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };

    const handleOtpChange = (e) => {
        const value = e.target.value;
        setOtp(value);
        validateOtp(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        validatePassword(value);
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        validateConfirmPassword(value);
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!validateEmail(email)) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
            
            if (response.data.success) {
                setSuccess('OTP has been sent to your email');
                setStep(2);
            } else {
                setError(response.data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        
        // Validate OTP
        if (!validateOtp(otp)) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:5000/api/verify-reset-otp', { 
                email, 
                otp 
            });
            
            if (response.data.success) {
                setSuccess('OTP verified successfully');
                setStep(3);
            } else {
                setError(response.data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Validate password and confirm password
        const isPasswordValid = validatePassword(newPassword);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
        
        if (!isPasswordValid || !isConfirmPasswordValid) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:5000/api/reset-password', {
                email,
                otp,
                newPassword
            });
            
            if (response.data.success) {
                setModalMessage('Password reset successful! You can now login with your new password.');
                setModalIsOpen(true);
                // Reset form after successful password reset
                setEmail('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(response.data.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        // Redirect to login page after closing modal
        window.location.href = '/login';
    };

    return (
        <div className="container_login">
            <div className="login-container">
                <div className="login-header">
                    <h2>Forgot Password</h2>
                    <p>{step === 1 ? 'Enter your email to reset password' : 
                        step === 2 ? 'Enter the OTP sent to your email' : 
                        'Create a new password'}</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                className={emailValid === false ? 'invalid' : ''}
                                placeholder="Enter your email"
                            />
                            {emailValid === false && <div className="validation-error">Please enter a valid email address</div>}
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}
                
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="otp">OTP Code</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={handleOtpChange}
                                className={otpValid === false ? 'invalid' : ''}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                            />
                            {otpValid === false && <div className="validation-error">Please enter a valid 6-digit OTP</div>}
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        
                        <div className="resend-otp">
                            <button 
                                type="button" 
                                className="resend-btn" 
                                onClick={handleRequestOtp}
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </form>
                )}
                
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className={passwordValid === false ? 'invalid' : ''}
                                placeholder="Enter new password"
                            />
                            {passwordValid === false && <div className="validation-error">Password must be at least 6 characters</div>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className={confirmPasswordValid === false ? 'invalid' : ''}
                                placeholder="Confirm new password"
                            />
                            {confirmPasswordValid === false && <div className="validation-error">Passwords do not match</div>}
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
                
                <div className="login-footer">
                    Remember your password? <Link to="/login">Sign in</Link>
                </div>
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Password Reset Success"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="modal-message">{modalMessage}</div>
                <button onClick={closeModal} className="modal-button">Go to Login</button>
            </Modal>
        </div>
    );
}

export default ForgotPassword;
