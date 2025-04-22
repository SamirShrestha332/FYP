import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterEditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    job_type: 'full-time'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  
  // Job type options
  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'job', label: 'Job' },
  ];
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          navigate('/recruiter/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch job details
        const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.job) {
          setJob(response.data.job);
        } else {
          setError('Failed to load job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob(prevJob => ({
      ...prevJob,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        navigate('/recruiter/login');
        return;
      }
      
      // Add recruiter_id to the job data
      const jobData = {
        ...job,
        recruiter_id: user.id
      };
      
      const response = await axios.put(`http://localhost:5000/api/job/${jobId}`, jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setSuccessMessage('Job updated successfully!');
        // Navigate back to jobs list after 2 seconds
        setTimeout(() => {
          navigate('/recruiter/jobs');
        }, 2000);
      } else {
        setError(response.data?.message || 'Failed to update job');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      setError(err.response?.data?.message || 'Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="recruiter-container">
        <RecruiterHeader />
        <div className="content-wrapper">
          <div className="loading">Loading job details...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="recruiter-container">
      <RecruiterHeader />
      <div className="content-wrapper">
        <div className="job-editor-container">
          <h2>Edit Job</h2>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={job.title}
                onChange={handleChange}
                required
                placeholder="e.g., Frontend Developer"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={job.company}
                onChange={handleChange}
                required
                placeholder="e.g., Hamro Job"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={job.location}
                onChange={handleChange}
                required
                placeholder="e.g., Kathmandu, Nepal"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="job_type">Job Type</label>
              <select
                id="job_type"
                name="job_type"
                value={job.job_type}
                onChange={handleChange}
                required
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                value={job.description}
                onChange={handleChange}
                required
                placeholder="Detailed job description..."
                rows="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                value={job.requirements}
                onChange={handleChange}
                required
                placeholder="Required skills, experience, education..."
                rows="6"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => navigate('/recruiter/jobs')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecruiterEditJob;