import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import Modal from 'react-modal';
Modal.setAppElement('#root');

function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [redirectNow, setRedirectNow] = useState(false);
    
    // Validation states
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);

    useEffect(() => {
        // Check if admin is already logged in
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    // Add effect for redirection
    useEffect(() => {
        if (redirectNow) {
            navigate('/admin/dashboard');
        }
    }, [redirectNow, navigate]);

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
        if (value.length < 6) {
            setPasswordValid(false);
            return false;
        }
        setPasswordValid(true);
        return true;
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields before submission
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            setError('Please correct the errors in the form.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:5000/admin/login", {
                email,
                password
            });

            console.log("Full server response:", response);
            
            // Check for success in multiple possible formats
            if (response.data.success || response.data.message === 'Login successful!') {
                // Store admin data
                if (response.data.admin) {
                    localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
                }
                if (response.data.token) {
                    localStorage.setItem('adminToken', response.data.token);
                }

                // Set success message
                setModalMessage('Admin login successful!');
                setModalIsOpen(true);
                
                // Force navigation after a short delay
                setTimeout(() => {
                    console.log('Forcing navigation to dashboard...');
                    window.location.href = '/admin/dashboard';
                }, 4000);
            } else {
                setError(response.data.message || "Login failed. Invalid credentials.");
            }
        } catch (err) {
            console.error("Admin Login Error:", err);
            setError(err.response?.data?.message || "A login error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        // Also redirect when modal is manually closed
        setRedirectNow(true);
    };

    // Add a manual redirect button to the modal
    const handleManualRedirect = () => {
        setModalIsOpen(false);
        navigate('/admin/dashboard');
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card">
                <div className="admin-auth-header">
                    <h2>Admin Login</h2>
                    <p>Sign in to access your admin dashboard</p>
                </div>
                
                {error && (
                    <div className="admin-error-message">
                        {error}
                    </div>
                )}
                
                <form className="admin-auth-form" onSubmit={handleSubmit}>
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
                        {passwordValid === false && <div className="validation-error">Password must be at least 6 characters</div>}
                    </div>
                    
                    <div className="admin-forgot-password">
                        <Link to="/admin/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Login Success"
                className="admin-modal-content"
                overlayClassName="admin-modal"
            >
                <div className="admin-modal-message">{modalMessage}</div>
                <button onClick={handleManualRedirect} className="admin-modal-button">Go to Dashboard</button>
            </Modal>
        </div>
    );
}

export default AdminLogin;