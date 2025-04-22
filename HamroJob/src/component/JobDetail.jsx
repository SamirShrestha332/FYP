import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';
import RecruiterHeader from './recruiter/RecruiterHeader';
import Modal from 'react-modal';
import './JobDetail.css';
import { FaMapMarkerAlt, FaBuilding, FaCalendarAlt, FaBriefcase, FaEdit, FaUsers } from 'react-icons/fa';
// Remove the JobApplicationForm import since we'll use a separate page

function JobDetail({ isRecruiterView = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [applying, setApplying] = useState(false);
    // We'll keep this for when users return from the application page
    const [applicationSuccess, setApplicationSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        fetchJobDetails();
        
        // Check if returning from successful application
        const successParam = new URLSearchParams(window.location.search).get('success');
        if (successParam === 'true') {
            setApplicationSuccess(true);
            // Clear the URL parameter
            window.history.replaceState({}, document.title, `/job/${id}`);
            // Reset success message after 5 seconds
            setTimeout(() => {
                setApplicationSuccess(false);
            }, 5000);
        }
    }, [id]);
    
    const fetchJobDetails = async () => {
        try {
            const token = isRecruiterView ? localStorage.getItem('token') : null;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const response = await axios.get(`http://localhost:5000/api/jobs/${id}`, config);
            setJob(response.data.job);
        } catch (err) {
            console.error('Error fetching job details:', err);
            setError('Failed to load job details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    // Update the handleApply function to navigate to the application page
    const handleApply = () => {
        if (!user) {
            // Redirect to login if not logged in
            navigate('/login', { state: { from: `/job/${id}` } });
            return;
        }
        
        // Navigate to the application page instead of showing the form
        navigate(`/apply/${id}`);
    };
    
    const handleEdit = () => {
        navigate(`/recruiter/job/${id}/edit`);
    };
    
    const handleStatusChange = () => {
        setShowConfirmModal(true);
    };
    
    const confirmStatusChange = async () => {
        setProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }
            
            const newStatus = job.status === 'active' ? 'closed' : 'active';
            // Set visibility based on status
            const visibility = newStatus === 'active' ? 'yes' : 'no';
            
            const response = await axios.put(
                `http://localhost:5000/api/jobs/${id}/status`, 
                { 
                    status: newStatus, 
                    recruiter_id: user?.id 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data && response.data.success) {
                // Update job status and visibility in state
                setJob({ ...job, status: newStatus, visibility: visibility });
                setShowConfirmModal(false);
                
                // Show success message
                const visibilityText = newStatus === 'active' ? 'visible to job seekers' : 'hidden from job seekers';
                setSuccessMessage(`Job status updated to ${newStatus} (${visibilityText})`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('Failed to update job status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            setError('Failed to update job status. Please try again later.');
        } finally {
            setProcessing(false);
            setShowConfirmModal(false);
        }
    };
    
    const handleViewApplicants = () => {
        navigate('/recruiter/applicants', { state: { jobId: id } });
    };
    
    // Add a function to handle successful application
    const handleApplicationSuccess = () => {
        setShowApplicationForm(false);
        setApplicationSuccess(true);
        // Reset success message after 5 seconds
        setTimeout(() => {
            setApplicationSuccess(false);
        }, 5000);
    };
    
    // Add a function to handle cancellation
    const handleCancelApplication = () => {
        setShowApplicationForm(false);
    };
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const getJobTypeLabel = (type) => {
        switch(type) {
            case 'job': return 'Full-time';
            case 'internship': return 'Internship';
            case 'part-time': return 'Part-time';
            case 'contract': return 'Contract';
            case 'freelance': return 'Freelance';
            default: return type;
        }
    };
    
    if (loading) {
        return (
            <div className="job-detail-container">
                {isRecruiterView ? <RecruiterHeader /> : <Navigation />}
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading job details...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="job-detail-container">
                {isRecruiterView ? <RecruiterHeader /> : <Navigation />}
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <Link to={isRecruiterView ? "/recruiter/jobs" : "/jobs"} className="back-button">
                        Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }
    
    if (!job) {
        return (
            <div className="job-detail-container">
                {isRecruiterView ? <RecruiterHeader /> : <Navigation />}
                <div className="not-found-message">
                    <h3>Job Not Found</h3>
                    <p>The job you're looking for doesn't exist or has been removed.</p>
                    <Link to={isRecruiterView ? "/recruiter/jobs" : "/jobs"} className="back-button">
                        Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="job-detail-container">
            {isRecruiterView ? <RecruiterHeader /> : <Navigation />}
            
            <div className="job-detail-header">
                <Link to={isRecruiterView ? "/recruiter/jobs" : "/jobs"} className="back-button">
                    ← Back to Jobs
                </Link>
                
                {/* Add Success Message */}
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
                
                {/* Show error message if there is one */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <div className="job-header-content">
                    <div className="job-title-section">
                        <h1>{job?.title}</h1>
                        <span className={`job-type ${job?.job_type}`}>
                            {job && getJobTypeLabel(job.job_type)}
                        </span>
                        <div className="job-status-wrapper">
                            <span className={`job-status ${job?.status}`}>
                                {job?.status === 'active' ? 'Active' : 'Closed'}
                            </span>
                            {isRecruiterView && (
                                <span className={`job-visibility ${job?.visibility === 'yes' ? 'visible' : 'hidden'}`}>
                                    {job?.visibility === 'yes' ? 'Visible' : 'Hidden'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="job-meta-info">
                        <div className="meta-item">
                            <FaBuilding className="meta-icon" />
                            <span>{job?.company}</span>
                        </div>
                        <div className="meta-item">
                            <FaMapMarkerAlt className="meta-icon" />
                            <span>{job?.location}</span>
                        </div>
                        <div className="meta-item">
                            <FaCalendarAlt className="meta-icon" />
                            <span>Posted on {job && formatDate(job.created_at)}</span>
                        </div>
                        <div className="meta-item">
                            <FaBriefcase className="meta-icon" />
                            <span>{job && getJobTypeLabel(job.job_type)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="job-detail-content">
                <div className="job-main-content">
                    <div className="job-description-section">
                        <h2>Job Description</h2>
                        <div className="job-description">
                            {job?.description.split('\n').map((paragraph, index) => (
                                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="job-requirements-section">
                        <h2>Requirements</h2>
                        <div className="job-requirements">
                            {job?.requirements.split('\n').map((requirement, index) => (
                                requirement ? <p key={index}>{requirement}</p> : <br key={index} />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="job-sidebar">
                    {isRecruiterView ? (
                        /* Recruiter Actions Sidebar */
                        <div className="recruiter-actions-card">
                            <h3>Job Management</h3>
                            <p>Manage your job posting</p>
                            
                            <button 
                                className="edit-button" 
                                onClick={handleEdit}
                            >
                                <FaEdit /> Edit Job
                            </button>
                            
                            <button 
                                className={job?.status === 'active' ? 'close-button' : 'activate-button'} 
                                onClick={handleStatusChange}
                            >
                                {job?.status === 'active' ? 'Close Job' : 'Activate Job'}
                            </button>
                            
                            <button 
                                className="view-applicants-button" 
                                onClick={handleViewApplicants}
                            >
                                <FaUsers /> View Applicants
                            </button>
                            
                            <div className="job-stats">
                                <div className="stat">
                                    <span className="stat-value">{job?.applicants_count || 0}</span>
                                    <span className="stat-label">Applicants</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{job?.views || 0}</span>
                                    <span className="stat-label">Views</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Job Seeker Application Sidebar */
                        <div className="application-card">
                            <h3>Apply for this position</h3>
                            <p>Take the next step in your career journey</p>
                            
                            {job?.status === 'closed' ? (
                                <div className="job-inactive-message">
                                    <p>This job is no longer accepting applications.</p>
                                </div>
                            ) : applicationSuccess ? (
                                <div className="application-success">
                                    <p>Application submitted successfully!</p>
                                    <p>The recruiter will contact you if interested.</p>
                                </div>
                            ) : (
                                <button 
                                    className="apply-button" 
                                    onClick={handleApply}
                                    disabled={applying || job?.status === 'closed'}
                                >
                                    {applying ? 'Submitting...' : 'Apply Now'}
                                </button>
                            )}
                            
                            {!user && job?.status === 'active' && (
                                <p className="login-prompt">
                                    Please <Link to="/login">log in</Link> to apply for this job.
                                </p>
                            )}
                        </div>
                    )}
                    
                    <div className="company-card">
                        <h3>About the Company</h3>
                        <h4>{job?.company}</h4>
                        <p className="company-location">
                            <FaMapMarkerAlt className="icon" /> {job?.location}
                        </p>
                        <p>This company is looking for talented individuals to join their team.</p>
                    </div>
                </div>
            </div>
            
            {/* Status Change Confirmation Modal */}
            {isRecruiterView && (
                <div className={showConfirmModal ? "modal-overlay" : "modal-overlay hidden"}>
                    {showConfirmModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <h2>
                                    {job?.status === 'active' 
                                        ? 'Close Job' 
                                        : 'Activate Job'
                                    }
                                </h2>
                                <p>
                                    {job?.status === 'active'
                                        ? 'Are you sure you want to close this job? It will no longer be visible to job seekers.'
                                        : 'Are you sure you want to activate this job? It will be visible to job seekers.'
                                    }
                                </p>
                                
                                <div className="modal-actions">
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => setShowConfirmModal(false)}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    {processing ? (
                                        <button className="loading-btn" disabled>
                                            Processing...
                                        </button>
                                    ) : job?.status === 'active' ? (
                                        <button 
                                            className="confirm-close-btn"
                                            onClick={confirmStatusChange}
                                        >
                                            Yes, Close Job
                                        </button>
                                    ) : (
                                        <button 
                                            className="confirm-activate-btn"
                                            onClick={confirmStatusChange}
                                        >
                                            Yes, Activate Job
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default JobDetail;