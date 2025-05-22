import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecruiterStyles.css';
import RecruiterHeader from './RecruiterHeader';

function RecruiterDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    newApplicants: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/recruiter/login');
      return;
    }
    
    setUser(JSON.parse(userData));

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const parsedUser = JSON.parse(userData);
        
        // Fetch stats
        const statsResponse = await axios.get('http://localhost:5000/api/recruiter/stats', {
          headers: { Authorization: `Bearer ${token}` },
          params: { recruiterId: parsedUser.id }
        }).catch(err => {
          console.error('Error fetching stats:', err);
          return null;
        });
        
        // Fetch recent jobs
        const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          params: { recruiterId: parsedUser.id, limit: 3 }
        }).catch(err => {
          console.error('Error fetching jobs:', err);
          return null;
        });
        
        // Fetch recent applicants
        const applicantsResponse = await axios.get('http://localhost:5000/api/applicants/recent', {
          headers: { Authorization: `Bearer ${token}` },
          params: { recruiterId: parsedUser.id, limit: 4 }
        }).catch(err => {
          console.error('Error fetching applicants:', err);
          return null;
        });
        
        // Update state with API responses or fall back to mock data
        if (statsResponse && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          // Fall back to mock data
          setStats({
            totalJobs: 5,
            activeJobs: 3,
            totalApplicants: 12,
            newApplicants: 4
          });
        }
        
        if (jobsResponse && jobsResponse.data && jobsResponse.data.jobs) {
          setRecentJobs(jobsResponse.data.jobs.slice(0, 3));
        } else {
          // Fall back to mock data
          setRecentJobs([
            { id: 1, title: 'Senior Web Developer', company: 'Your Company', location: 'Remote', applicants_count: 5, status: 'active', created_at: '2023-05-15' },
            { id: 2, title: 'UI/UX Designer', company: 'Your Company', location: 'Kathmandu', applicants_count: 3, status: 'active', created_at: '2023-05-10' },
            { id: 3, title: 'Project Manager', company: 'Your Company', location: 'Pokhara', applicants_count: 4, status: 'active', created_at: '2023-05-05' }
          ]);
        }
        
        if (applicantsResponse && applicantsResponse.data && applicantsResponse.data.applicants) {
          setRecentApplicants(applicantsResponse.data.applicants.slice(0, 4));
        } else {
          // Fall back to mock data
          setRecentApplicants([
            { id: 1, name: 'John Doe', jobTitle: 'Senior Web Developer', applied_at: '2023-05-16', status: 'new' },
            { id: 2, name: 'Jane Smith', jobTitle: 'UI/UX Designer', applied_at: '2023-05-15', status: 'new' },
            { id: 3, name: 'Mike Johnson', jobTitle: 'Project Manager', applied_at: '2023-05-14', status: 'reviewed' },
            { id: 4, name: 'Sarah Williams', jobTitle: 'Senior Web Developer', applied_at: '2023-05-13', status: 'interviewed' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterHeader />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterHeader />
        <div className="dashboard-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
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
          <h1>Welcome back, {user?.firstName || user?.username || ''}!</h1>
          <p>Here's what's happening with your job postings</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total-jobs-icon"></div>
            <h3>Total Jobs</h3>
            <p className="stat-number">{stats.totalJobs}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon active-jobs-icon"></div>
            <h3>Active Jobs</h3>
            <p className="stat-number">{stats.activeJobs}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon total-applicants-icon"></div>
            <h3>Total Applicants</h3>
            <p className="stat-number">{stats.totalApplicants}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon new-applicants-icon"></div>
            <h3>New Applicants</h3>
            <p className="stat-number">{stats.newApplicants}</p>
          </div>
        </div>

        <div className="dashboard_content">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Jobs</h2>
              <Link to="/recruiter/jobs" className="view-all">View All Jobs</Link>
            </div>
            {recentJobs.length === 0 ? (
              <div className="no-data">
                <p>You haven't posted any jobs yet</p>
                <Link to="/recruiter/post-job" className="post-job-link">Post Your First Job</Link>
              </div>
            ) : (
              <div className="job-list">
                {recentJobs.map(job => (
                  <div className="job-item" key={job.id}>
                    <div className="job-info">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                      <p className="job-location">{job.location}</p>
                      <p className="job-meta">
                        <span>{job.applicants_count || 0} applicants</span>
                        <span>Posted on: {formatDate(job.created_at)}</span>
                      </p>
                    </div>
                    <div className="job-status-badge">
                      <span className={`status ${job.status}`}>{job.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>Recent Applicants</h2>
              <Link to="/recruiter/applicants" className="view-all">View All Applicants</Link>
            </div>
            {recentApplicants.length === 0 ? (
              <div className="no-data">
                <p>You don't have any applicants yet</p>
                <p className="no-data-info">Once candidates apply to your jobs, they will appear here</p>
              </div>
            ) : (
              <div className="applicant-list">
                {recentApplicants.map(applicant => (
                  <div className="applicant-item" key={applicant.id}>
                    <div className="applicant-info">
                      <h3 className="applicant-name">{applicant.name}</h3>
                      <p className="applicant-job">Applied for: {applicant.jobTitle}</p>
                      <p className="applicant-date">Applied on: {formatDate(applicant.applied_at)}</p>
                    </div>
                    <div className="applicant-status-badge">
                      <span className={`status ${applicant.status}`}>{applicant.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-actions">
          <Link to="/recruiter/post-job" className="action-card">
            <div className="action-icon post-job-icon"></div>
            <div className="action-content">
              <h3>Post a New Job</h3>
              <p>Create a new job listing</p>
            </div>
          </Link>
          <Link to="/recruiter/profile" className="action-card">
            <div className="action-icon profile-icon"></div>
            <div className="action-content">
              <h3>Update Profile</h3>
              <p>Keep your information current</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;