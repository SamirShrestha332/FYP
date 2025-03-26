import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Homepage.css'; // Use the same styling as homepage

function JobSection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userString || !token) {
          navigate('/login');
          return;
        }
        
        // Set initial user data from localStorage
        const userData = JSON.parse(userString);
        setUser(userData);
        
        // Fetch jobs from the API
        try {
          const response = await axios.get('http://localhost:3000/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.jobs) {
            setJobs(response.data.jobs);
            console.log('Jobs fetched successfully:', response.data.jobs);
          } else {
            console.log('No jobs found in the response');
            setJobs([]);
          }
        } catch (serverError) {
          console.error('Error fetching jobs from server:', serverError);
          setError('Failed to fetch jobs. Please try again later.');
        } finally {
          setLoading(false);
        }
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const getFilteredJobs = () => {
    if (!jobs) return [];
    
    if (activeFilter === 'all') {
      return jobs;
    }
    
    return jobs.filter(job => {
      if (activeFilter === 'recent') {
        // Show jobs posted in the last 7 days
        const jobDate = new Date(job.created_at);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return jobDate >= oneWeekAgo;
      }
      
      return job.location.toLowerCase().includes(activeFilter.toLowerCase());
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !user) return <div className="error">{error}</div>;

  return (
    <div className="Homepage_container">
      <div className="homepage">
        {/* Navigation */}
        <div className="nav">
          <div className="logo">
            <img className="Logo" src="/src/assets/Logo.png" alt="Job Portal Logo" />
          </div>
          <nav>
            <ul>
              <li><a href="/jobs" className="active">Jobs</a></li>
              <li><a href="/#about">About Us</a></li>
              {user && <li><a href="/applications">My Applications</a></li>}
            </ul>
          </nav>
          <div className="nav-controls">
            <div className="search-icon">
              <ion-icon name="search-outline" className="search-outline"></ion-icon>
            </div>
            {user ? (
              <div className="user-menu-container">
                <div className="user-menu-trigger">
                  <span className="user-name">{user.username}</span>
                  <ion-icon name="chevron-down-outline"></ion-icon>
                </div>
              </div>
            ) : (
              <>
                <button className="signin-button" onClick={() => navigate('/signup')}>SignUp</button>
                <button className="login-button" onClick={() => navigate('/login')}>LogIn</button>
              </>
            )}
          </div>
        </div>

        {/* Job Section - Using the same styling as homepage */}
        <div className="jobsection">
          <p className="Heading">Find your Job</p>
          <p>Explore all available job opportunities. Find the perfect match for your skills and career goals.</p>
          
          {/* Search Bar */}
          <div className="search-filter-container" style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0'
          }}>
            <div className="search-bar" style={{ maxWidth: '600px' }}>
              <input type="text" placeholder="Search for job titles, companies, or keywords..." />
              <button>Search</button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="filter-tabs" style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0',
            gap: '10px'
          }}>
            <button 
              className={activeFilter === 'all' ? 'active-filter' : 'filter-button'} 
              onClick={() => handleFilterChange('all')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                backgroundColor: activeFilter === 'all' ? '#007bff' : '#f8f8f8',
                color: activeFilter === 'all' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              All Jobs
            </button>
            <button 
              className={activeFilter === 'recent' ? 'active-filter' : 'filter-button'} 
              onClick={() => handleFilterChange('recent')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                backgroundColor: activeFilter === 'recent' ? '#007bff' : '#f8f8f8',
                color: activeFilter === 'recent' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              Recent
            </button>
            <button 
              className={activeFilter === 'kathmandu' ? 'active-filter' : 'filter-button'} 
              onClick={() => handleFilterChange('kathmandu')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                backgroundColor: activeFilter === 'kathmandu' ? '#007bff' : '#f8f8f8',
                color: activeFilter === 'kathmandu' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              Kathmandu
            </button>
            <button 
              className={activeFilter === 'remote' ? 'active-filter' : 'filter-button'} 
              onClick={() => handleFilterChange('remote')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                backgroundColor: activeFilter === 'remote' ? '#007bff' : '#f8f8f8',
                color: activeFilter === 'remote' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              Remote
            </button>
          </div>
          
          <div className="job_container">
            {getFilteredJobs().length === 0 ? (
              <div className="no-jobs" style={{ textAlign: 'center', padding: '20px' }}>
                No jobs found matching your filters.
              </div>
            ) : (
              getFilteredJobs().map((job, index) => (
                <div className="jobs" key={index}>
                  <div className="image_sections">
                    <img src="/src/assets/Companylogo.png" alt="Company logo" />
                  </div>
                  <div className="job_info">
                    <p className="jobdetails">{job.title}</p>
                    <div className="companyname">{job.company}</div>
                    <div className="jobtime_button">
                      <p className="time">{new Date(job.created_at).toLocaleDateString()}</p>
                      <button onClick={() => navigate(`/job/${job.id}`)}>View Job</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {getFilteredJobs().length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
              <button className="View_All_Button">Load More Jobs</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobSection;
