import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    const fetchUserAndApplicants = async () => {
      try {
        // Get recruiter-specific user data
        const userData = localStorage.getItem('recruiterUser') || localStorage.getItem('user');
        const token = localStorage.getItem('recruiterToken') || localStorage.getItem('token');
        
        if (!userData || !token) {
          navigate('/recruiter/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        
        // Verify this is a recruiter account
        if (parsedUser.role !== 'recruiter') {
          navigate('/recruiter/login');
          return;
        }
        
        setUser(parsedUser);
        
        // First fetch the recruiter's jobs
        try {
          const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
            headers: { Authorization: `Bearer ${token}` },
            params: { recruiterId: parsedUser.id }
          });
          
          if (jobsResponse.data && jobsResponse.data.jobs) {
            setJobs(jobsResponse.data.jobs);
            
            // Then fetch all applications for this recruiter's jobs
            try {
              // Updated endpoint to match your database structure
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
            setError('No jobs found. Post a job to start receiving applications.');
          }
        } catch (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          setError('Failed to load jobs. Please try again later.');
        }
      } catch (error) {
        console.error('Error in RecruiterApplicants:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndApplicants();
  }, [navigate, location]);

  // Add this function for mock data
  const loadMockData = () => {
    console.log('Loading mock applicant data as fallback');
    const mockApplicants = [
      {
        id: 1,
        user_id: 21,
        job_id: 15,
        username: 'Sujal Basnet',
        email: 'sujal.basnet6002@gmail.com',
        job_title: 'Backend Developer',
        company: 'Hamro job',
        status: 'pending',
        created_at: '2025-04-10 14:30:00',
        resume: 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1746013736/CV_resume/resume_21_1746013737341.docx',
        cover_letter: 'I am excited to apply for this position...',
        video_url: 'https://res.cloudinary.com/dfplmkziu/video/upload/v1746013739/video_resumes/video_21_1746013739580.mp4'
      },
      {
        id: 2,
        user_id: 19,
        job_id: 16,
        username: 'Samir Shrestha',
        email: 'samirxtha098@gmail.com',
        job_title: 'Frontend developer',
        company: 'HIrely',
        status: 'pending',
        created_at: '2025-04-11 09:15:00',
        resume: 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1745374842/CV_resume/resume_19_1745374843606.docx',
        cover_letter: 'I believe my skills in design...',
        video_url: 'https://res.cloudinary.com/dfplmkziu/video/upload/v1745374845/video_resumes/video_19_1745374845244.mp4'
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
      // Use the correct token from localStorage
      const token = localStorage.getItem('recruiterToken') || localStorage.getItem('token');
      
      // Updated endpoint to match your database structure
      const response = await axios.put(`http://localhost:5000/api/applications/${applicantId}/status`, 
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

  const openResumeModal = (applicant) => {
    setSelectedApplicant(applicant);
    setModalOpen(true);
  };

  const closeResumeModal = () => {
    setModalOpen(false);
    setSelectedApplicant(null);
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
              className={activeFilter === 'pending' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('pending')}
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
              className={activeFilter === 'accepted' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => handleFilterChange('accepted')}
            >
              Accepted
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
                  <h3 className="applicant-name">{applicant.username}</h3>
                  <div className={`applicant-status ${applicant.status}`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </div>
                </div>
                
                <div className="applicant-details">
                  <p className="applicant-email">{applicant.email}</p>
                  <p className="applicant-job">Applied for: {applicant.job_title || jobs.find(job => job.id === applicant.job_id)?.title}</p>
                  <p className="applicant-date">Applied on: {formatDate(applicant.created_at)}</p>
                </div>
                
                <div className="cover-letter-preview">
                  <h4>Cover Letter</h4>
                  <p>{applicant.cover_letter.substring(0, 150)}...</p>
                </div>
                
                <div className="applicant-actions">
                  <div className="resume-actions">
                    <a href={applicant.resume} target="_blank" rel="noopener noreferrer" className="view-resume-btn">
                      View Resume
                    </a>
                    {applicant.video_url && (
                      <a href={applicant.video_url} target="_blank" rel="noopener noreferrer" className="view-video-btn">
                        View Video
                      </a>
                    )}
                  </div>
                  
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
                        className={applicant.status === 'accepted' ? 'active' : ''}
                        onClick={() => updateApplicantStatus(applicant.id, 'accepted')}
                        disabled={applicant.status === 'accepted'}
                      >
                        Accept
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
        
        {modalOpen && selectedApplicant && (
          <div className="resume-modal">
            <div className="resume-modal-content">
              <button className="close-modal" onClick={closeResumeModal}>×</button>
              <h2>Application Details</h2>
              
              <div className="applicant-info">
                <h3>{selectedApplicant.username}</h3>
                <p>{selectedApplicant.email}</p>
              </div>
              
              <div className="resume-container">
                <iframe 
                  src={selectedApplicant.resume} 
                  title="Resume" 
                  width="100%" 
                  height="500px"
                ></iframe>
              </div>
              
              {selectedApplicant.video_url && (
                <div className="video-container">
                  <h3>Video Resume</h3>
                  <video 
                    src={selectedApplicant.video_url} 
                    controls 
                    width="100%" 
                    height="300px"
                  ></video>
                </div>
              )}
              
              <div className="cover-letter-full">
                <h3>Cover Letter</h3>
                <p>{selectedApplicant.cover_letter}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className={`status-btn ${selectedApplicant.status === 'reviewed' ? 'active' : ''}`}
                  onClick={() => updateApplicantStatus(selectedApplicant.id, 'reviewed')}
                >
                  Mark as Reviewed
                </button>
                <button 
                  className={`status-btn ${selectedApplicant.status === 'accepted' ? 'active' : ''}`}
                  onClick={() => updateApplicantStatus(selectedApplicant.id, 'accepted')}
                >
                  Accept
                </button>
                <button 
                  className={`status-btn ${selectedApplicant.status === 'rejected' ? 'active' : ''}`}
                  onClick={() => updateApplicantStatus(selectedApplicant.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterApplicants;