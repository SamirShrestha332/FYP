import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

    // Add this function or update your existing handleSubmit function
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validate all fields
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
            // Make sure the URL matches your server endpoint
            const response = await axios.post("http://localhost:3000/signup", {
                firstName,
                lastName,
                email,
                password,
                role
            });
            
            console.log("Signup response:", response.data);
            
            if (response.status === 201) {
                setModalMessage("Account created successfully! Redirecting to login...");
                setModalIsOpen(true);
                
                // Redirect after a delay
                setTimeout(() => {
                    setModalIsOpen(false);
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError(error.response?.data?.message || "Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container_signup">
            <div className="signup-container">
                <form onSubmit={handleSubmit}>
                    <h2>Sign up</h2>
                    {error && <p className="error-message">{error}</p>}
                    
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            className={firstNameValid === false ? 'is-invalid' : firstNameValid === true ? 'is-valid' : ''}
                            required
                        />
                        {firstNameValid === false && (
                            <div className="validation-feedback invalid-feedback">
                                First name is required
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={handleLastNameChange}
                            className={lastNameValid === false ? 'is-invalid' : lastNameValid === true ? 'is-valid' : ''}
                            required
                        />
                        {lastNameValid === false && (
                            <div className="validation-feedback invalid-feedback">
                                Last name is required
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={handleEmailChange}
                            className={emailValid === false ? 'is-invalid' : emailValid === true ? 'is-valid' : ''}
                            required
                        />
                        {emailValid === false && (
                            <div className="validation-feedback invalid-feedback">
                                Please enter a valid email address
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={passwordValid === false ? 'is-invalid' : passwordValid === true ? 'is-valid' : ''}
                            required
                        />
                        {passwordValid === false && (
                            <div className="validation-feedback invalid-feedback">
                                Password must be at least 6 characters
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={confirmPasswordValid === false ? 'is-invalid' : confirmPasswordValid === true ? 'is-valid' : ''}
                            required
                        />
                        {confirmPasswordValid === false && (
                            <div className="validation-feedback invalid-feedback">
                                Passwords do not match
                            </div>
                        )}
                    </div>
                    
                    <input type="hidden" value={"seeker"} name="role" />
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing up..." : "Sign up"}
                    </button>
                    <p className="login-link">
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </form>
            </div>

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
                        onClick={closeModal}
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
                        Go to Login
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Signup;