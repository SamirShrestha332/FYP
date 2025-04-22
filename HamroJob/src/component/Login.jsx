import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import Modal from 'react-modal'; 
Modal.setAppElement('#root'); 

function Login() {
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
            setError("Please fix the validation errors before submitting.");
            return;
        }
        
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/login", {
                email,
                password
            });

            if (response.data.message === 'Login successful!') {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Set login status flag
                localStorage.setItem('isLoggedIn', 'true');
                // Store token if available
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                } else {
                    // Use a dummy token for development
                    localStorage.setItem('token', 'sample-token-for-development');
                }

                // Set modal message and open the modal
                setModalMessage('Login successful!');
                setModalIsOpen(true);

                // Close the modal and redirect after a delay
                setTimeout(() => {
                    setModalIsOpen(false);
                    navigate('/');
                    // Force a page reload to update the navigation
                    window.location.reload();
                }, 1500);

            } else {
                setError(response.data.message || "Login failed. Invalid credentials.");
            }

        } catch (error) {
            console.error("Login Error:", error);
            setError(error.response?.data?.message || "A login error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className="container_login">
            <div className="login-container">
                <div className="login-header">
                    <h2>User Login</h2>
                    <p>Sign in to access your account</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
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
                    
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="login-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Login Success"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="modal-message">{modalMessage}</div>
                <button onClick={closeModal} className="modal-button">Close</button>
            </Modal>
        </div>
    );
}

export default Login;