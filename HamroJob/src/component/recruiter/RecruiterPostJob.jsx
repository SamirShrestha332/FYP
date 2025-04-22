import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterPostJob() {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form fields
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    
    // Validation states
    const [titleValid, setTitleValid] = useState(null);
    const [companyValid, setCompanyValid] = useState(null);
    const [locationValid, setLocationValid] = useState(null);
    const [descriptionValid, setDescriptionValid] = useState(null);
    const [requirementsValid, setRequirementsValid] = useState(null);
    




    
    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            // Pre-fill company name if available
            if (parsedUser.companyName) {
                setCompany(parsedUser.companyName);
                setCompanyValid(true);
            }
            
            // Log user data to check the ID
            console.log('User data from localStorage:', parsedUser);
        } else {
            // Redirect to login if not logged in
            navigate('/recruiter/login');
        }
    }, [navigate]);
    
    // Validation functions
    const validateTitle = (value) => {
        if (!value.trim()) {
            setTitleValid(false);
            return false;
        }
        setTitleValid(true);
        return true;
    };
    
    const validateCompany = (value) => {
        if (!value.trim()) {
            setCompanyValid(false);
            return false;
        }
        setCompanyValid(true);
        return true;
    };
    
    const validateLocation = (value) => {
        if (!value.trim()) {
            setLocationValid(false);
            return false;
        }
        setLocationValid(true);
        return true;
    };
    
    const validateDescription = (value) => {
        if (!value.trim() || value.length < 20) {
            setDescriptionValid(false);
            return false;
        }
        setDescriptionValid(true);
        return true;
    };
    
    const validateRequirements = (value) => {
        if (!value.trim()) {
            setRequirementsValid(false);
            return false;
        }
        setRequirementsValid(true);
        return true;
    };
    
    // Handle input changes with validation
    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        validateTitle(value);
    };
    
    const handleCompanyChange = (e) => {
        const value = e.target.value;
        setCompany(value);
        validateCompany(value);
    };
    
    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);
        validateLocation(value);
    };
    
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        validateDescription(value);
    };
    
    const handleRequirementsChange = (e) => {
        const value = e.target.value;
        setRequirements(value);
        validateRequirements(value);
    };
    
    // Add job_type state and validation
    const [jobType, setJobType] = useState('job'); // Default to 'job'
    
    // Add to your handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isTitleValid = validateTitle(title);
        const isCompanyValid = validateCompany(company);
        const isLocationValid = validateLocation(location);
        const isDescriptionValid = validateDescription(description);
        const isRequirementsValid = validateRequirements(requirements);
        
        if (!isTitleValid || !isCompanyValid || !isLocationValid || !isDescriptionValid || !isRequirementsValid) {
            setError("Please correct the errors in the form.");
            return;
        }
        
        if (!user) {
            setError("User information is missing. Please log in again.");
            return;
        }
        
        // Get the correct recruiter ID
        const recruiterId = user.id || user.userId || user.recruiterId;
        
        if (!recruiterId) {
            console.error('No valid recruiter ID found in user object:', user);
            setError("Could not determine your recruiter ID. Please log out and log in again.");
            return;
        }
        
        console.log('Submitting job with recruiter_id:', recruiterId);
        
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const response = await axios.post('http://localhost:5000/api/job/recruiter', {
                title,
                company,
                location,
                description,
                requirements,
                recruiter_id: recruiterId, // Use the correct ID
                job_type: jobType
            });
            
            if (response.data.success) {
                setSuccess(true);
                // Clear form after successful submission
                setTitle('');
                setCompany('');
                setLocation('');
                setDescription('');
                setRequirements('');
                setJobType('job'); // Reset job type
                
                // Reset validation states
                setTitleValid(null);
                setCompanyValid(null);
                setLocationValid(null);
                setDescriptionValid(null);
                setRequirementsValid(null);
                
                // Scroll to top to show success message
                window.scrollTo(0, 0);
            } else {
                setError(response.data.message || "Failed to post job. Please try again.");
            }
        } catch (error) {
            console.error("Error posting job:", error);
            setError(error.response?.data?.message || "An error occurred while posting the job.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="recruiter-dashboard">
            <RecruiterHeader />
            
            <div className="dashboard-container">
                <div className="welcome-section">
                    <h1>Post a New Job</h1>
                    <p>Create a new job posting to find the perfect candidate</p>
                </div>
                
                {success && (
                    <div className="success-message">
                        Job posted successfully! You can view it in your jobs list.
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form className="recruiter-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Job Title*</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={handleTitleChange}
                            className={titleValid === false ? 'invalid' : ''}
                            placeholder="e.g. Frontend Developer"
                        />
                        {titleValid === false && <div className="validation-error">Job title is required</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="company">Company Name*</label>
                        <input
                            type="text"
                            id="company"
                            value={company}
                            onChange={handleCompanyChange}
                            className={companyValid === false ? 'invalid' : ''}
                            placeholder="e.g. Tech Solutions Inc."
                        />
                        {companyValid === false && <div className="validation-error">Company name is required</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="location">Location*</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={handleLocationChange}
                            className={locationValid === false ? 'invalid' : ''}
                            placeholder="e.g. Kathmandu, Nepal"
                        />
                        {locationValid === false && <div className="validation-error">Location is required</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Job Description*</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={handleDescriptionChange}
                            className={descriptionValid === false ? 'invalid' : ''}
                            placeholder="Provide a detailed description of the job..."
                            rows="6"
                        ></textarea>
                        {descriptionValid === false && <div className="validation-error">Job description is required (minimum 20 characters)</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="requirements">Requirements*</label>
                        <textarea
                            id="requirements"
                            value={requirements}
                            onChange={handleRequirementsChange}
                            className={requirementsValid === false ? 'invalid' : ''}
                            placeholder="List the skills, qualifications, and experience required..."
                            rows="4"
                        ></textarea>
                        {requirementsValid === false && <div className="validation-error">Job requirements are required</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="jobType">Job Type*</label>
                        <select
                            id="jobType"
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="form-control"
                        >
                            <option value="job">Full-time Job</option>
                            <option value="internship">Internship</option>
                            <option value="part-time">Part-time</option>
                            
                        </select>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RecruiterPostJob;