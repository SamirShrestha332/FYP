import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './RecruiterAuthStyles.css';
import Modal from 'react-modal'; 
Modal.setAppElement('#root'); 

function RecruiterLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    // Add validation states
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    
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
        if (!value || value.length < 1) {
            setPasswordValid(false);
            return false;
        }
        setPasswordValid(true);
        return true;
    };
    
    // Handle input changes with validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };
    
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validate all fields before submission
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            setError("Please correct the errors in the form.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Changed port from 300 to 5000 to match your server configuration
            const response = await axios.post('http://localhost:5000/api/recruiter/login', {
                email,
                password
            });
            
            console.log('Login response:', response.data);
            
            // Check if login was successful based on your API response structure
            if (response.data.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'recruiter'); // Add role for role-based access
                
                // Show success modal
                setModalMessage('Login successful! Redirecting to dashboard...');
                setModalIsOpen(true);
                
                // Redirect after a short delay
                setTimeout(() => {
                    setModalIsOpen(false);
                    navigate('/recruiter/dashboard');
                }, 1500);
            } else {
                setError(response.data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className="recruiter-auth-container">
            <div className="recruiter-auth-card">
                <div className="recruiter-auth-header">
                    <h2>Recruiter Login</h2>
                    <p>Sign in to access your recruiter dashboard</p>
                </div>
                
                {error && (
                    <div className="recruiter-error-message">
                        {error}
                    </div>
                )}
                
                <form className="recruiter-auth-form" onSubmit={handleSubmit}>
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
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={passwordValid === false ? 'invalid' : ''}
                            placeholder="Enter your password"
                        />
                        {passwordValid === false && <div className="validation-error">Password is required</div>}
                    </div>
                    
                    <div className="recruiter-forgot-password">
                        <Link to="/recruiter/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="recruiter-auth-footer">
                    Don't have a recruiter account? <Link to="/recruiter/signup">Sign up</Link>
                </div>
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Login Success"
                className="recruiter-modal-content"
                overlayClassName="recruiter-modal"
            >
                <div className="recruiter-modal-message">{modalMessage}</div>
                <button onClick={closeModal} className="recruiter-modal-button">Close</button>
            </Modal>
        </div>
    );
}

export default RecruiterLogin;