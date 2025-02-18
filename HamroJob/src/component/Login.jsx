import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Modal from 'react-modal'; 
Modal.setAppElement('#root'); 

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
    const [modalMessage, setModalMessage] = useState(''); // Modal message

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:3000/login", {
                email,
                password
            });

            if (response.data.message === 'Login successful!') {
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Set modal message and open the modal
                setModalMessage('Login successful!');
                setModalIsOpen(true);

                // Close the modal and redirect after a delay (optional)
                setTimeout(() => {
                    setModalIsOpen(false);
                    navigate('/');
                }, 2000); // Adjust delay as needed

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
                <form onSubmit={handleSubmit}>
                    <h2>Log In</h2>
                    {error && <p className="error">{error}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="signup-link">
                        Don't have an account? <a href="/signup">Signup</a>
                    </p>
                </form>
            </div>


            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{ // You can customize the modal's style here
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
                <p>{modalMessage}</p>
               
            </Modal>


        </div>
    );
}

export default Login;