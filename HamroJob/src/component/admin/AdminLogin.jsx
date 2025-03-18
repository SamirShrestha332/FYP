import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import Modal from 'react-modal';
Modal.setAppElement('#root');

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [redirectNow, setRedirectNow] = useState(false);

    // Add effect for redirection
    useEffect(() => {
        if (redirectNow) {
            navigate('/admin/dashboard');
        }
    }, [redirectNow, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

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
        } catch (error) {
            console.error("Admin Login Error:", error);
            setError(error.response?.data?.message || "A login error occurred.");
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
            <div className="admin-login-form">
                <h2>Admin Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
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
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
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