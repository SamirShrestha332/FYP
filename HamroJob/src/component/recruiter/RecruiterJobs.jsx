import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import './JobCardStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, jobId: null, action: null });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const fetchUserAndJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          console.log('No user data or token found in localStorage');
          navigate('/recruiter/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch jobs using the token for authentication
        try {
          console.log(`Fetching jobs for recruiter ID: ${parsedUser.id}`);
          
          // Use the same endpoint structure as JobSection but for recruiter jobs
          const response = await axios.get('http://localhost:5000/api/job', {
            headers: { Authorization: `Bearer ${token}` },
            params: { recruiterId: parsedUser.id }
          });
          
          console.log('API Response:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            // Ensure each job has a visibility field
            const jobsWithVisibility = response.data.map(job => {
              console.log('Processing job:', job);
              // If visibility is undefined or null, set it based on status
              if (job.visibility === undefined || job.visibility === null) {
                job.visibility = job.status === 'active' ? 'yes' : 'no';
              }
              // Ensure closed jobs always have visibility='no'
              if (job.status === 'closed' && job.visibility === 'yes') {
                job.visibility = 'no';
              }
              return job;
            });
            
            setJobs(jobsWithVisibility);
            console.log('Jobs set:', jobsWithVisibility);
          } else if (response.data && response.data.jobs) {
            // Alternative structure where jobs might be in a 'jobs' property
            const jobsWithVisibility = response.data.jobs.map(job => {
              // If visibility is undefined or null, set it based on status
              if (job.visibility === undefined || job.visibility === null) {
                job.visibility = job.status === 'active' ? 'yes' : 'no';
              }
              // Ensure closed jobs always have visibility='no'
              if (job.status === 'closed' && job.visibility === 'yes') {
                job.visibility = 'no';
              }
              return job;
            });
            
            setJobs(jobsWithVisibility);
            console.log('Jobs set from jobs property:', jobsWithVisibility);
          } else {
            console.log('Response data format not recognized:', response.data);
            setJobs([]);
            setError('No jobs found or unexpected data format. Try loading sample data.');
          }
        } catch (serverError) {
          console.error('Error fetching jobs from server:', serverError);
          
          if (serverError.response) {
            console.error('Error response:', serverError.response.data);
            console.error('Status code:', serverError.response.status);
          }
          
          setError('Failed to load jobs. Please try again later.');
          console.log('Loading mock data due to server error');
          loadMockData(); // Load mock data if there's a server error
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndJobs();
  }, [navigate]);

  // Add this function for mock data
  const loadMockData = () => {
    console.log('Loading mock data as fallback');
    const mockJobs = [
      {
        _id: '1', // Using _id to match MongoDB format
        id: 15,
        title: 'Hotel manager',
        company: 'Saliman Hotel',
        location: 'Putalisadak, Nepal',
        description: 'Job Description details',
        requirements: 'need a quality person',
        status: 'active',
        recruiter_id: 1,
        job_type: 'full-time',
        created_at: '2025-04-11',
        updated_at: null,
        applicants_count: 0,
        views: 15,
        visibility: 'yes'
      },
      {
        _id: '2',
        id: 16,
        title: 'salaksjahsd',
        company: 'Hamro jobas',
        location: 'adasdgasgs',
        description: 'you have a make a basic website for the client requirement.',
        requirements: 'Must know about react, for styling must know about tailwind css as well',
        status: 'closed',
        recruiter_id: 1,
        job_type: 'full-time',
        created_at: '2025-04-11',
        updated_at: null,
        applicants_count: 0,
        views: 0,
        visibility: 'no'
      },
      {
        _id: '3',
        id: 17,
        title: 'Software developer',
        company: 'Hamro job',
        location: 'Software developer',
        description: 'Design user interfaces for our web applications',
        requirements: 'Figma, Adobe XD, and user research skills required',
        status: 'closed',
        recruiter_id: 1,
        job_type: 'full-time',
        created_at: '2025-04-11',
        updated_at: null,
        applicants_count: 0,
        views: 0,
        visibility: 'no'
      },
      {
        _id: '4',
        id: 18,
        title: 'Product maanaegr',
        company: 'Hamro job',
        location: 'Lalitpur, Nepal',
        description: 'Lead product development for our flagship application',
        requirements: 'Minimum 3 years experience in product management',
        status: 'active',
        recruiter_id: 1,
        job_type: 'job',
        created_at: '2025-04-11',
        updated_at: null,
        applicants_count: 0,
        views: 0,
        visibility: 'yes'
      }
    ];
    
    console.log('Mock jobs:', mockJobs);
    setJobs(mockJobs);
    setLoading(false);
    setError(null);
  };

  const handleTabChange = (tab) => {
    console.log("Changing tab to:", tab);
    setActiveTab(tab);
  };

  const filteredJobs = jobs.filter(job => {
    // Log each job's status to debug
    console.log(`Filtering job ${job.id || job._id}: status=${job.status}, activeTab=${activeTab}`);
    
    // Normalize status values
    const jobStatus = (job.status || '').toLowerCase();
    
    if (activeTab === 'active') return jobStatus === 'active';
    if (activeTab === 'closed') return jobStatus === 'closed' || jobStatus === 'inactive';
    return true; // 'all' tab shows everything
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showConfirmModal = (jobId, action) => {
    setConfirmModal({ show: true, jobId, action });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ show: false, jobId: null, action: null });
  };

  const handleStatusChange = async (jobId, status) => {
    setIsLoading(true);
    setError(null);
    hideConfirmModal();

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        navigate('/recruiter/login');
        return;
      }

      console.log(`Updating job ${jobId} status to ${status}`);
      
      // Make sure this endpoint matches your API structure
      const response = await axios.put(`http://localhost:5000/api/job/${jobId}/status`, 
        { status, recruiter_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Status update response:', response.data);

      if (response.data.success) {
        // Update the job status and visibility in the state
        setJobs(prevJobs => {
          return prevJobs.map(job => {
            if ((job.id === jobId) || (job._id === jobId)) {
              // Set visibility based on status
              const visibility = status === 'active' ? 'yes' : 'no';
              return { ...job, status, visibility };
            }
            return job;
          });
        });
        
        // Show success message
        const visibilityText = status === 'active' ? 'visible to job seekers' : 'hidden from job seekers';
        setSuccessMessage(`Job status updated to ${status} (${visibilityText})`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update job status');
      }
    } catch (err) {
      console.error('Error updating job status:', err);
      if (err.response) {
        console.error('Server response error:', err.response.data);
      }
      setError(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setIsLoading(false);
    }
  };

  const editJob = async (jobId) => {
    try {
      // Navigate to edit job page with job ID
      navigate(`/recruiter/jobs/edit/${jobId}`);
    } catch (err) {
      console.error('Error navigating to edit job:', err);
      setError('Failed to navigate to edit job page');
    }
  };

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterHeader />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-container">
      <RecruiterHeader />
      <div className="content-wrapper">
        <div className="recruiter-jobs-container">
          <h1 className="page-title">My Job Postings</h1>
          
          <div className="filter-tabs">
            <button 
              className={activeTab === 'all' ? 'filter-tab active' : 'filter-tab'} 
              onClick={() => handleTabChange('all')}
            >
              All Jobs
            </button>
            <button 
              className={activeTab === 'active' ? 'filter-tab active' : 'filter-tab'} 
              onClick={() => handleTabChange('active')}
            >
              Active Jobs
            </button>
            <button 
              className={activeTab === 'closed' ? 'filter-tab active' : 'filter-tab'} 
              onClick={() => handleTabChange('closed')}
            >
              Closed Jobs
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          {!error && filteredJobs.length === 0 ? (
            <div className="empty-state">
              <p className="empty-message">
                {activeTab === 'active' 
                  ? "You don't have any active jobs." 
                  : activeTab === 'closed' 
                    ? "You don't have any closed jobs." 
                    : "You haven't posted any jobs yet."}
              </p>
              <Link to="/recruiter/post-job" className="post-job-button">
                Post a New Job
              </Link>
              <button onClick={loadMockData} className="load-sample-data">
                Load Sample Data
              </button>
            </div>
          ) : (
            <>
              <div className="header-actions">
                <Link to="/recruiter/post-job" className="post-job-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Post a New Job
                </Link>
              </div>
              
              <div className="jobs-grid">
                {filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-status-tags">
                        <span className={`status-tag ${job.status === 'active' ? 'active-tag' : 'closed-tag'}`}>
                          {job.status === 'active' ? 'ACTIVE' : 'CLOSED'}
                        </span>
                        <span className={`status-tag ${job.visibility === 'yes' ? 'visible-tag' : 'hidden-tag'}`}>
                          {job.visibility === 'yes' ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="job-meta">
                      <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        <strong>Company:</strong> {job.company}
                      </div>
                      
                      <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        <strong>Location:</strong> {job.location}
                      </div>
                      
                      <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                        <strong>Type:</strong> {job.job_type}
                      </div>
                      
                      <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        <strong>Posted:</strong> {formatDate(job.created_at)}
                      </div>
                      
                      <div className="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                          <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                        </svg>
                        <strong>Applicants:</strong> {job.applicants_count || 0}
                      </div>
                    </div>
                    
                    <div className="job-actions">
                      <Link to={`/recruiter/job/${job.id}`} className="view-btn action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                        View Details
                      </Link>
                      <button onClick={() => editJob(job.id)} className="edit-btn action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                        Edit
                      </button>
                      {job.status === 'active' ? (
                        <button 
                          onClick={() => showConfirmModal(job.id, 'close')} 
                          className="close-btn action-btn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zm6.8 1.991V12.02l4.7 2.576V3.008L8.8 3.991zM3.5 3.008v11.588l4.7-2.576V3.991L3.5 3.008z"/>
                          </svg>
                          Close Job
                        </button>
                      ) : (
                        <button 
                          onClick={() => showConfirmModal(job.id, 'activate')} 
                          className="activate-btn action-btn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                          </svg>
                          Activate Job
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {confirmModal.show && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-content">
                  <h2>
                    {confirmModal.action === 'close' 
                      ? 'Close Job' 
                      : 'Activate Job'
                    }
                  </h2>
                  <p>
                    {confirmModal.action === 'close'
                      ? 'Are you sure you want to close this job? It will no longer be visible to job seekers.'
                      : 'Are you sure you want to activate this job? It will be visible to job seekers.'
                    }
                  </p>
                  
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={hideConfirmModal}>
                      Cancel
                    </button>
                    {isLoading ? (
                      <button className="loading-btn" disabled>
                        Processing...
                      </button>
                    ) : confirmModal.action === 'close' ? (
                      <button 
                        className="confirm-close-btn"
                        onClick={() => handleStatusChange(confirmModal.jobId, 'closed')}
                      >
                        Yes, Close Job
                      </button>
                    ) : (
                      <button 
                        className="confirm-activate-btn"
                        onClick={() => handleStatusChange(confirmModal.jobId, 'active')}
                      >
                        Yes, Activate Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'closed' && (
            <div className="info-message">
              <p><strong>Note:</strong> Closed jobs are only visible to you as a recruiter. Job seekers cannot see closed jobs because their visibility is set to 'no'.</p>
            </div>
          )}
          
          {/* Developer helper button - can be removed in production */}
          {filteredJobs.length === 0 && (
            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5 }}>
              <button onClick={loadMockData} style={{ 
                background: 'none', 
                border: '1px dashed #ccc', 
                padding: '0.5rem 1rem', 
                cursor: 'pointer',
                color: '#666',
                fontSize: '0.8rem'
              }}>
                [Developer] Load Sample Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterJobs;
