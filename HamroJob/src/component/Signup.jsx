import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";

function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyRole, setCompanyRole] = useState("");
    const [error, setError] = useState(null); // State for error message

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError(null); // Clear any previous errors

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const data = {
            firstName,
            lastName,
            email,
            password,
            role,
        };

        if (role === "employee") {
            data.companyName = companyName;
            data.companyRole = companyRole;
        }

        try {
            const response = await axios.post("http://localhost:3000/signup", data);
            alert(response.data.message);
            // Reset the form after successful signup (optional)
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setRole("");
            setCompanyName("");
            setCompanyRole("");

        } catch (error) {
            console.error("Signup error:", error); // Log the full error
            setError(error.response?.data?.message || "Signup failed"); // Set the error message
        }
    };

    return (
        <div className="container_signup">
            <div className="signup-container">
                <form onSubmit={handleSubmit}>
                    <h2>Sign up</h2>
                    {error && <p className="error-message">{error}</p>} {/* Display error message */}
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                    <p className="login-link">
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Signup;