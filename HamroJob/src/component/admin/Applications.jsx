import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Applications.css';
import Sidebar from './Sidebar';

function Applications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [applicationsPerPage] = useState(10);

    useEffect(() => {
        // Check if admin is logged in
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Fetch applications data
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                
                // Fetch real application data from our API
                console.log('Fetching applications with token:', token ? 'Token exists' : 'No token');
                const response = await axios.get('http://localhost:5000/api/applications/admin/all');
                
                // Log the response for debugging
                console.log('API Response:', response.data);
                
                if (response.data && response.data.success) {
                    console.log('Fetched applications successfully:', response.data.applications.length);
                    
                    // Format the applications data to match component requirements
                    const formattedApplications = response.data.applications.map(app => ({
                        id: app.id,
                        jobTitle: app.job_title,
                        company: app.company,
                        applicant: app.applicant_name,
                        email: app.applicant_email,
                        date: new Date(app.created_at).toISOString().split('T')[0],
                        status: app.status,
                        resume: app.resume,
                        video: app.video_url,
                        coverLetter: app.cover_letter
                    }));
                    
                    setApplications(formattedApplications);
                } else {
                    console.error('Failed to fetch applications:', response.data);
                    setApplications([]);
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [navigate]);

    // Filter applications based on search term and status
    const filteredApplications = applications.filter(application => {
        const matchesSearch = 
            application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.applicant.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastApplication = currentPage * applicationsPerPage;
    const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
    const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            
            // Call the API to update application status
            const response = await axios.put(`http://localhost:5000/api/applications/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            if (response.data && response.data.success) {
                console.log(`Successfully updated application ${id} status to ${newStatus}`);
                
                // Update local state to reflect the change
                setApplications(applications.map(app => 
                    app.id === id ? { ...app, status: newStatus } : app
                ));
            } else {
                console.error('Failed to update application status:', response.data);
            }
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-applications">
            <Sidebar />
            
            <div className="applications-content">
                <div className="applications-header">
                    <h1>Application Management</h1>
                </div>

                <div className="filters">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search applications..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="status-filter">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="applications-table-container">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Applicant</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentApplications.map(application => (
                                <tr key={application.id}>
                                    <td>{application.id}</td>
                                    <td>{application.jobTitle}</td>
                                    <td>{application.company}</td>
                                    <td>{application.applicant}</td>
                                    <td>{application.date}</td>
                                    <td>
                                        <select 
                                            className={`status-select ${application.status}`}
                                            value={application.status}
                                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="view-btn">View</button>
                                            <button className="download-btn">Download CV</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Applications;