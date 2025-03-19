import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
            const response = await axios.post("http://localhost:3000/admin/login", {
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
                }, 1500);
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
        <div className="admin-login-container">
            <form className="admin-login-form" onSubmit={handleSubmit}>
                <h2>Admin Login</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={emailValid === false ? 'is-invalid' : emailValid === true ? 'is-valid' : ''}
                        placeholder="Enter admin email"
                        autoComplete="email"
                        required
                    />
                    {emailValid === false && (
                        <div className="validation-feedback invalid-feedback">
                            Please enter a valid email address
                        </div>
                    )}
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className={passwordValid === false ? 'is-invalid' : passwordValid === true ? 'is-valid' : ''}
                        placeholder="Enter admin password"
                        autoComplete="current-password"
                        required
                    />
                    {passwordValid === false && (
                        <div className="validation-feedback invalid-feedback">
                            Password must be at least 6 characters
                        </div>
                    )}
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '5px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        width: '300px'
                    }
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <p>{modalMessage}</p>
                    <button 
                        onClick={handleManualRedirect}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default AdminLogin;