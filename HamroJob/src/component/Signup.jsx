import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/signup", { 
        username, email, password, role, companyName, companyRole 
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="container">

   
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign up</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
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
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Select Role</option>
          <option value="employee">Employee</option>
          <option value="seeker">Seeker</option>
        </select>
        {role === "employee" && (
          <>
            <input 
              type="text" 
              placeholder="Company Name" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Company Role" 
              value={companyRole} 
              onChange={(e) => setCompanyRole(e.target.value)} 
              required 
            />
          </>
        )}
        <button type="submit">Sign up</button>

        {/* Login Link */}
        <p className="login-link">
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
    </div>
  );
}

export default Signup;
