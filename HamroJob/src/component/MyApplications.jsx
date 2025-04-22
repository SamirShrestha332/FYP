import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserApplications.css'; // Reuse the same CSS
import Navigation from './Navigation';
import { FaArrowLeft, FaFilter } from 'react-icons/fa';

function MyApplications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage first
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          setError('Please log in to view your applications');
          setTimeout(() => {
            navigate('/login', { state: { from: '/applications' } });
          }, 2000);
          return;
        }
        
        const user = JSON.parse(userData);
        setUser(user);
        
        // Fetch user's applications
        const response = await axios.get(
          `http://localhost:5000/api/applications/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data && response.data.applications) {
          setApplications(response.data.applications);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'all') return true;
    return app.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="user-applications-container">
      <Navigation />
      <div className="applications-header">
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back to Home
        </button>
        <h1>My Applications</h1>
      </div>
      
      <div className="filter-container">
        <div className="filter-label">
          <FaFilter /> Filter by status:
        </div>
        <div className="filter-options">
          <button 
            className={activeFilter === 'all' ? 'active' : ''} 
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={activeFilter === 'pending' ? 'active' : ''} 
            onClick={() => handleFilterChange('pending')}
          >
            Pending
          </button>
          <button 
            className={activeFilter === 'reviewed' ? 'active' : ''} 
            onClick={() => handleFilterChange('reviewed')}
          >
            Reviewed
          </button>
          <button 
            className={activeFilter === 'rejected' ? 'active' : ''} 
            onClick={() => handleFilterChange('rejected')}
          >
            Rejected
          </button>
          <button 
            className={activeFilter === 'accepted' ? 'active' : ''} 
            onClick={() => handleFilterChange('accepted')}
          >
            Accepted
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredApplications.length > 0 ? (
        <div className="applications-list">
          {filteredApplications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3>{application.job.title}</h3>
                <span className={`status-badge ${application.status.toLowerCase()}`}>
                  {application.status}
                </span>
              </div>
              <div className="application-company">
                {application.job.company} - {application.job.location}
              </div>
              <div className="application-date">
                Applied on: {new Date(application.appliedDate).toLocaleDateString()}
              </div>
              <div className="application-actions">
                <Link to={`/application-details/${application.id}`} className="view-application-btn">
                  View Application
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="browse-jobs-btn">Browse Jobs</Link>
        </div>
      )}
    </div>
  );
}

export default MyApplications;