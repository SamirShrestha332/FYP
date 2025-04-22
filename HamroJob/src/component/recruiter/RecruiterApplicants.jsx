import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterApplicants() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchUserAndApplicants = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          navigate('/recruiter/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // First fetch the recruiter's jobs
        try {
          const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
            headers: { Authorization: `Bearer ${token}` },
            params: { recruiterId: parsedUser.id }
          });
          
          if (jobsResponse.data && jobsResponse.data.jobs) {
            setJobs(jobsResponse.data.jobs);
            
            // Then fetch all applicants for this recruiter's jobs
            try {
              const applicantsResponse = await axios.get(`http://localhost:5000/api/applications/recruiter/${parsedUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (applicantsResponse.data && applicantsResponse.data.applications) {
                setApplicants(applicantsResponse.data.applications);
                console.log('Applications loaded:', applicantsResponse.data.applications);
              } else {
                setApplicants([]);
                setError('No applications found for your jobs.');
              }
            } catch (applicantsError) {
              console.error('Error fetching applications:', applicantsError);
              setError('Failed to load applications. Please try again later.');
            }
          } else {
            setJobs([]);
            setError('You need to post jobs before you can see applicants.');
          }
        } catch (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          setError('Failed to load your jobs. Please try again later.');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndApplicants();
  }, [navigate]);

  // Add this function for mock data
  const loadMockData = () => {
    console.log('Loading mock applicant data as fallback');
    const mockApplicants = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        job_id: 15,
        job_title: 'Backend Developer',
        company: 'Hamro job',
        status: 'new',
        applied_date: '2025-04-10 14:30:00',
        resume_url: '/resumes/john-doe-resume.pdf',
        cover_letter: 'I am excited to apply for this position...'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        job_id: 16,
        job_title: 'Frontend developer',
        company: 'HIrely',
        status: 'reviewed',
        applied_date: '2025-04-11 09:15:00',
        resume_url: '/resumes/jane-smith-resume.pdf',
        cover_letter: 'I believe my skills in design...'
      }
    ];
    
    setApplicants(mockApplicants);
    setLoading(false);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleJobChange = (e) => {
    setSelectedJob(e.target.value);
  };

  const getFilteredApplicants = () => {
    return applicants.filter(applicant => {
      // Filter by job if a specific job is selected
      if (selectedJob !== 'all' && applicant.job_id.toString() !== selectedJob) {
        return false;
      }
      
      // Filter by status
      if (activeFilter === 'all') return true;
      return applicant.status === activeFilter;
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`http://localhost:5000/api/applicants/${applicantId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        // Update the applicant status in the local state
        setApplicants(applicants.map(applicant => 
          applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
        ));
      } else {
        setError('Failed to update applicant status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating applicant status:', error);
      setError('Failed to update applicant status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterHeader />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard">
      <RecruiterHeader />
      
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Applicants</h1>
          <p>Review and manage job applications</p>
        </div>
        
        <div className="applicants-filters">
          <div className="filter-by-job">
            <label htmlFor="job-filter">Filter by Job:</label>
            <select 
              id="job-filter" 
              value={selectedJob} 
              onChange={handleJobChange}
              className="job-select"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id.toString()}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="status-filter-tabs">
            <button 
              className={activeFilter === 'all' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button 
              className={activeFilter === 'new' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('new')}
            >
              New
            </button>
            <button 
              className={activeFilter === 'reviewed' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('reviewed')}
            >
              Reviewed
            </button>
            <button 
              className={activeFilter === 'interviewed' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('interviewed')}
            >
              Interviewed
            </button>
            <button 
              className={activeFilter === 'hired' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('hired')}
            >
              Hired
            </button>
            <button 
              className={activeFilter === 'rejected' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            <div className="error-actions">
              <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
              <button onClick={loadMockData} className="retry-btn">Load Sample Data</button>
            </div>
          </div>
        )}
        
        {!error && getFilteredApplicants().length === 0 && (
          <div className="no-applicants-container">
            <div className="no-applicants-message">
              {selectedJob !== 'all' 
                ? `No ${activeFilter !== 'all' ? activeFilter : ''} applicants for this job.` 
                : `No ${activeFilter !== 'all' ? activeFilter : ''} applicants found.`}
            </div>
            {jobs.length === 0 && (
              <Link to="/recruiter/post-job" className="post-job-link">Post a New Job</Link>
            )}
          </div>
        )}
        
        {getFilteredApplicants().length > 0 && (
          <div className="applicants-grid">
            {getFilteredApplicants().map(applicant => (
              <div className="applicant-card" key={applicant.id}>
                <div className="applicant-header">
                  <h3 className="applicant-name">{applicant.name}</h3>
                  <div className={`applicant-status ${applicant.status}`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </div>
                </div>
                
                <div className="applicant-details">
                  <p className="applicant-email">{applicant.email}</p>
                  <p className="applicant-job">Applied for: {applicant.job_title}</p>
                  <p className="applicant-date">Applied on: {formatDate(applicant.applied_date)}</p>
                </div>
                
                <div className="cover-letter-preview">
                  <h4>Cover Letter</h4>
                  <p>{applicant.cover_letter.substring(0, 150)}...</p>
                </div>
                
                <div className="applicant-actions">
                  <button className="view-resume-btn">View Resume</button>
                  
                  <div className="status-update">
                    <h4>Update Status:</h4>
                    <div className="status-buttons">
                      <button 
                        className={applicant.status === 'reviewed' ? 'active' : ''}
                        onClick={() => updateApplicantStatus(applicant.id, 'reviewed')}
                        disabled={applicant.status === 'reviewed'}
                      >
                        Mark as Reviewed
                      </button>
                      <button 
                        className={applicant.status === 'interviewed' ? 'active' : ''}
                        onClick={() => updateApplicantStatus(applicant.id, 'interviewed')}
                        disabled={applicant.status === 'interviewed'}
                      >
                        Mark as Interviewed
                      </button>
                      <button 
                        className={applicant.status === 'hired' ? 'active' : ''}
                        onClick={() => updateApplicantStatus(applicant.id, 'hired')}
                        disabled={applicant.status === 'hired'}
                      >
                        Hire
                      </button>
                      <button 
                        className={applicant.status === 'rejected' ? 'active' : ''}
                        onClick={() => updateApplicantStatus(applicant.id, 'rejected')}
                        disabled={applicant.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterApplicants;