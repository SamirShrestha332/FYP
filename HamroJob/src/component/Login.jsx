import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/login", {
        email, password
      });

      if (response.data.status === 'success') {
        localStorage.setItem('token', response.data.token); // Store token
        navigate('/'); // Navigate before alert to avoid delay
        
      } else {
        alert(response.data.message || "Login Failed. Invalid credentials.");
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "A login error occurred.");
    }
  };

  return (
    <div className="container_login">
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h2>Log In</h2>
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
          <button type="submit">Login</button> {/* Removed onClick handler */}

          <p className="signup-link">
            Don't have an account? <a href="/signup">Signup</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
