import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ApplicationDetails.css';
import Navigation from './Navigation';
import { FaArrowLeft, FaFilePdf, FaFileWord, FaVideo } from 'react-icons/fa';

function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          setError('User information is missing. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        console.log('Fetching application with ID:', applicationId);

        const response = await axios.get(
          `http://localhost:5000/api/applications/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.application) {
          setApplication(response.data.application);
        } else {
          setError('Application details not found.');
        }
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, navigate]);

  const handleBack = () => {
    navigate('/applications');
  };

  const getFileIcon = (filename) => {
    if (!filename) return null;
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <FaFilePdf className="file-icon pdf" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FaFileWord className="file-icon word" />;
    }
    return null;
  };

  const openResume = () => {
    if (application && application.resumeUrl) {
      window.open(application.resumeUrl, '_blank');
    }
  };

  return (
    <div className="application-details-container">
      <Navigation />
      <div className="application-details-header">
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back to My Applications
        </button>
        <h1>Application Details</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading application details...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : application ? (
        <div className="application-details-content">
          <div className="application-job-info">
            <h2>{application.job.title}</h2>
            <div className="company-info">
              <img 
                src="/src/assets/Companylogo.png" 
                alt={application.job.company} 
                className="company-logo"
              />
              <div>
                <p className="company-name">{application.job.company}</p>
                <p className="job-location">{application.job.location}</p>
              </div>
            </div>
          </div>

          <div className="application-status-section">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value status-${application.status.toLowerCase()}`}>
                {application.status}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Applied on:</span>
              <span className="status-value">
                {new Date(application.appliedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="application-documents">
            <h3>Your Application Documents</h3>
            
            {application.resumeUrl && (
              <div className="document-item" onClick={openResume}>
                {getFileIcon(application.resumeFilename)}
                <div className="document-info">
                  <p className="document-name">{application.resumeFilename || 'Resume'}</p>
                  <p className="document-action">Click to view</p>
                </div>
              </div>
            )}

            {application.videoUrl && (
              <div className="video-container">
                <h4>Video Resume</h4>
                <video 
                  controls 
                  className="application-video"
                  src={application.videoUrl}
                  poster="/video-thumbnail.png"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div className="cover-letter-section">
            <h3>Cover Letter</h3>
            <div className="cover-letter-content">
              {application.coverLetter ? (
                <p>{application.coverLetter}</p>
              ) : (
                <p className="no-content">No cover letter provided</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="not-found-message">Application not found</div>
      )}
    </div>
  );
}

export default ApplicationDetails;