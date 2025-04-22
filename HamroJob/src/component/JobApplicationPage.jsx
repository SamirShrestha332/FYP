import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './JobApplicationPage.css';
import Navigation from './Navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [video, setVideo] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const checkUserAndFetchJob = async () => {
      try {
        // Check for both user data and token
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          setError('User information is missing. Please log in again.');
          // Set a flag to prevent multiple redirects
          if (!userChecked) {
            setTimeout(() => {
              navigate('/login', { state: { from: `/job/${jobId}/apply` } });
            }, 2000); // Give user time to see the error message
            setUserChecked(true);
          }
          return;
        }
        
        try {
          const user = JSON.parse(userData);
          if (!user || !user.id) {
            setError('User information is incomplete. Please log in again.');
            localStorage.removeItem('user'); // Clear invalid user data
            localStorage.removeItem('token'); // Clear token
            if (!userChecked) {
              setTimeout(() => {
                navigate('/login', { state: { from: `/job/${jobId}/apply` } });
              }, 2000);
              setUserChecked(true);
            }
            return;
          }
          
          setUserId(user.id);
          
          // Fetch job details
          const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.job) {
            setJobDetails(response.data.job);
          } else {
            setError('Job details not found.');
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError('Invalid user data. Please log in again.');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          if (!userChecked) {
            setTimeout(() => {
              navigate('/login', { state: { from: `/job/${jobId}/apply` } });
            }, 2000);
            setUserChecked(true);
          }
        }
      } catch (err) {
        console.error('Error in authentication check:', err);
        setError('Failed to verify your session. Please try again later.');
      }
    };
    
    checkUserAndFetchJob();
  }, [jobId, navigate, userChecked]);

  const validateResume = (file) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return `Resume file must not exceed 20MB (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
    }
    return null;
  };

  const validateVideo = (file) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return `Video file must not exceed 20MB (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
    }
    return null;
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const resumeError = validateResume(file);
      if (resumeError) {
        setError(resumeError);
        return;
      }
      setResume(file);
      setResumeFileName(file.name);
      setError('');
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoError = validateVideo(file);
      if (videoError) {
        setError(videoError);
        return;
      }
      setVideo(file);
      setVideoFileName(file.name);
      setError('');
    }
  };

  const clearResume = () => {
    setResume(null);
    setResumeFileName('');
    document.getElementById('resume').value = '';
  };

  const clearVideo = () => {
    setVideo(null);
    setVideoFileName('');
    document.getElementById('video').value = '';
    setError('');
  };

  // Inside your component, add a new state for upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Update your handleSubmit function to show progress
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Double-check user authentication before submission
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      setError('User information is missing. Please log in again.');
      setTimeout(() => {
        navigate('/login', { state: { from: `/job/${jobId}/apply` } });
      }, 2000);
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user || !user.id) {
        setError('User information is incomplete. Please log in again.');
        return;
      }
      
      // Continue with your existing submission logic
      if (!resume) {
        setError('Please upload your resume');
        return;
      }

      if (video) {
        const videoError = validateVideo(video);
        if (videoError) {
          setError(videoError);
          return;
        }
      }

      // Now start the loading indicators
      setLoading(true);
      setIsUploading(true);
      setUploadProgress(0);

      // Create a new FormData object
      const formData = new FormData();
      
      // Append fields one by one
      formData.append('jobId', jobId);
      formData.append('userId', user.id); // Use user.id from parsed userData
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);
      
      // Append video file if exists
      if (video) {
        formData.append('video', video);
      }
      
      // Send request to server with token and track progress
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/applications/apply',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          setUploadProgress(percentCompleted);
        }
      });

      console.log('Server response:', response.data);
      setSuccess(true);
      setIsUploading(false);
      
      // Redirect after successful submission with a delay
      setTimeout(() => {
        navigate(`/job/${jobId}?success=true`);
      }, 2000);
      
    } catch (error) {
      console.error('Application submission error:', error);
      setIsUploading(false);
      
      if (error.response) {
        console.error('Server error response:', error.response.data);
        
        // Check if the error is about already applied - improved detection
        const errorData = error.response.data;
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : errorData.message || 'Error submitting application';
        
        // More comprehensive check for "already applied" messages
        const alreadyAppliedKeywords = ['already applied', 'previously applied', 'duplicate application'];
        const isAlreadyApplied = 
          error.response.status === 409 || // Conflict status code
          alreadyAppliedKeywords.some(keyword => 
            errorMessage.toLowerCase().includes(keyword)
          );
        
        if (isAlreadyApplied) {
          setError('You have already applied for this job');
        } else {
          setError(errorMessage);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please try again.');
      } else {
        console.error('Request setup error:', error.message);
        setError('Error preparing your application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/job/${jobId}`);
  };

  // In your return statement, add the loader
  return (
    <div className="application-page-container">
      <Navigation />
      <div className="application-page-header">
        <a onClick={handleCancel} className="back-button">
          &larr; Back to Job
        </a>
        {jobDetails && (
          <>
            <h1>{jobDetails.title}</h1>
            <div className="company-name">{jobDetails.company} - {jobDetails.location}</div>
          </>
        )}
      </div>
      
      <div className="application-form-container">
        <form onSubmit={handleSubmit} className="application-form" encType="multipart/form-data">
          <div className="form-group">
            <label>Resume/CV (Required)</label>
            <div className="file-input-wrapper">
              <div className="file-input-container">
                <label htmlFor="resume" className="choose-file-btn">Choose File</label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  required
                  className="file-input"
                />
                <div className="file-name">
                  {resumeFileName || 'No file chosen'}
                  {resumeFileName && (
                    <button type="button" onClick={clearResume} className="clear-file">×</button>
                  )}
                </div>
              </div>
            </div>
            <div className="file-formats">Accepted formats: PDF, DOC, DOCX</div>
          </div>

          <div className="form-group">
            <label>Video Resume (Optional)</label>
            <div className="file-input-wrapper">
              <div className="file-input-container">
                <label htmlFor="video" className="choose-file-btn">Choose File</label>
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleVideoChange}
                  className="file-input"
                />
                <div className="file-name">
                  {videoFileName || 'No file chosen'}
                  {videoFileName && (
                    <button type="button" onClick={clearVideo} className="clear-file">×</button>
                  )}
                </div>
              </div>
            </div>
            <div className="video-requirements">
              <p>Maximum duration: 5 minutes, Maximum size: 20MB</p>
              <p>Accepted formats: MP4, MOV, AVI</p>
            </div>
          </div>

          <div className="form-group">
            <label>Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
              rows="6"
              name="coverLetter"
            />
          </div>

          {isUploading && (
            <div className="loader-container">
              <div className="loader"></div>
              <div className="loader-text">
                {uploadProgress < 100 
                ? `Uploading application... ${uploadProgress}%` 
                : 'Processing your application...'}
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Application submitted successfully! Redirecting...</div>}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading || isUploading}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading || isUploading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplicationPage;