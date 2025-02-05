import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/login", { 
        email, password 
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">

   
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
        <button type="submit">Login</button>

        {/* Signup Link */}
        <p className="signup-link">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </form>
    </div>
    </div>
  );
}

export default Login;
