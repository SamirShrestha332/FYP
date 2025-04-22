import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import Modal from 'react-modal';
Modal.setAppElement('#root');

function Signup() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("seeker"); // Default to seeker
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Validation states
    const [firstNameValid, setFirstNameValid] = useState(null);
    const [lastNameValid, setLastNameValid] = useState(null);
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);

    // Validation functions
    const validateFirstName = (value) => {
        if (!value.trim()) {
            setFirstNameValid(false);
            return false;
        }
        setFirstNameValid(true);
        return true;
    };

    const validateLastName = (value) => {
        if (!value.trim()) {
            setLastNameValid(false);
            return false;
        }
        setLastNameValid(true);
        return true;
    };

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

    const validateConfirmPassword = (value) => {
        if (value !== password) {
            setConfirmPasswordValid(false);
            return false;
        }
        setConfirmPasswordValid(true);
        return true;
    };

    // Handle input changes with validation
    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        setFirstName(value);
        validateFirstName(value);
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        setLastName(value);
        validateLastName(value);
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
        // Also validate confirm password if it has a value
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        validateConfirmPassword(value);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form fields
        const isFirstNameValid = validateFirstName(firstName);
        const isLastNameValid = validateLastName(lastName);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
        
        // Check if all validations pass
        if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
            !isPasswordValid || !isConfirmPasswordValid) {
            setError("Please fix the validation errors before submitting.");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:5000/signup', {
                firstName,
                lastName,
                email,
                password,
                role
            });            
            if (response.data) {
                // Redirect to OTP verification page with email
                navigate('/verify-otp', { 
                  state: { 
                    email 
                  } 
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError(error.response?.data?.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-auth-container">
            <div className="user-auth-card">
                <div className="user-auth-header">
                    <h2>User Signup</h2>
                    <p>Create your account to find jobs</p>
                </div>
                
                {error && (
                    <div className="user-error-message">
                        {error}
                    </div>
                )}
                
                <form className="user-auth-form" onSubmit={handleSubmit}>
                    <div className="user-form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={handleFirstNameChange}
                                className={firstNameValid === false ? 'invalid' : ''}
                                placeholder="Enter your first name"
                            />
                            {firstNameValid === false && <div className="validation-error">First name is required</div>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={handleLastNameChange}
                                className={lastNameValid === false ? 'invalid' : ''}
                                placeholder="Enter your last name"
                            />
                            {lastNameValid === false && <div className="validation-error">Last name is required</div>}
                        </div>
                    </div>
                    
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
                            placeholder="Create a password"
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
                            placeholder="Confirm your password"
                        />
                        {confirmPasswordValid === false && <div className="validation-error">Passwords do not match</div>}
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="user-auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Signup Success"
                className="user-modal-content"
                overlayClassName="user-modal"
            >
                <div className="user-modal-message">{modalMessage}</div>
                <button onClick={closeModal} className="user-modal-button">Login Now</button>
            </Modal>
        </div>
    );
}

export default Signup;